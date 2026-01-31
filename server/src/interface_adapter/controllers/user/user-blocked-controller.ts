import { inject, injectable } from "tsyringe";
import type { Response } from "express";

import type { ICheckUserBlockedUsecase } from "../../../application/usecase/interfaces/user/check-user-blocked-usecase.js";
import {
  COOKIES_NAMES,
  ERROR_MESSAGE,
  HTTP_STATUS,
} from "../../../shared/constants/constants.js";
import { clearCookie } from "../../../shared/utils/cookieHelper.js";
import type { CustomRequest } from "../../middlewares/auth-middleware.js";

@injectable()
export class BlockedUserController {
  constructor(
    @inject("ICheckUserBlockedUsecase")
    private readonly checkUserBlockedUsecase: ICheckUserBlockedUsecase
  ) {}

  async handle(req: CustomRequest, res: Response): Promise<boolean> {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
      });
      return true;
    }

    const { id, role } = req.user;

    try {
      const isBlocked = await this.checkUserBlockedUsecase.execute(id, role);

      if (isBlocked) {
        clearCookie(
          res,
          COOKIES_NAMES.ACCESS_TOKEN,
          COOKIES_NAMES.REFRESH_TOKEN
        );

        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.USER_BLOCKED
        });

        return true;
      }

      return false;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "USER_NOT_FOUND"
      ) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGE.USER.NOT_FOUND
        });
        return true;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.SERVER_ERROR
      });
      return true;
    }
  }
}