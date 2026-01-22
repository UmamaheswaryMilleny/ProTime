import type { Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import type { IUserRepository } from "../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IBlockedUserMiddleware } from "../interfaces/user/blocked-user-middleware-interface.js";

import {
  COOKIES_NAMES,
  ERROR_MESSAGE,
  HTTP_STATUS,
} from "../../shared/constants/constants.js";

import { clearCookie } from "../../shared/utils/cookieHelper.js";
import type { CustomRequest } from "./auth-middleware.js";

@injectable()
export class BlockedUserMiddleware implements IBlockedUserMiddleware {
  constructor(
    @inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async checkBlockedUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const { id, role } = req.user;

      // Admin should never be blocked
      if (role === "admin") {
        next();
        return;
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.USER_NOT_FOUND
        });
        return;
      }

      if (user.isBlocked) {
        clearCookie(
          res,
          COOKIES_NAMES.ACCESS_TOKEN,
          COOKIES_NAMES.REFRESH_TOKEN
        );

        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.USER_BLOCKED
        });
        return;
      }

      next();
    } catch (error) {
      console.error("BlockedUserMiddleware error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.SERVER_ERROR
      });
    }
  }
}