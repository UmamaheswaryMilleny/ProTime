import { inject, injectable } from "tsyringe";
import type { Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/constants.js";
import type { CustomRequest } from "../../middlewares/auth-middleware.js";
import type { IGetUserProfileUsecase } from "../../../application/usecase/interfaces/user/get-user-profile-usecase-interface.js";
import type { IUpdateUserProfileUsecase } from "../../../application/usecase/interfaces/user/update-user-profile-interface.js";
import { UserProfileMapper } from "../../../application/mapper/user-profile-mapper.js";
import { ResponseHelper } from "../../../infrastructure/config/helper/response-helper.js";

@injectable()
export class UserController {
  constructor(
    @inject("IGetUserProfileUsecase")
    private readonly getUserProfileUsecase: IGetUserProfileUsecase,

    @inject("IUpdateUserProfileUsecase")
    private readonly updateUserProfileUsecase: IUpdateUserProfileUsecase
  ) {}

  /**
   * Get user profile
   */
  async getProfile(req: CustomRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    try {
      const userEntity = await this.getUserProfileUsecase.execute(req.user.id);
      const profileDTO = UserProfileMapper.toDTO(userEntity);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: profileDTO,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      ResponseHelper.error(
        res,
        "Failed to fetch profile",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update user profile
   */
async updateProfile(req: CustomRequest, res: Response): Promise<void> {
  if (!req.user) {
    ResponseHelper.error(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  try {
    const updateData = req.body;

    console.log("Profile Update Request:", updateData);

    const updatedUser = await this.updateUserProfileUsecase.execute(
      req.user.id,
      updateData
    );

    const profileDTO = UserProfileMapper.toDTO(updatedUser);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      "Profile updated successfully",
      profileDTO
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    ResponseHelper.error(
      res,
      error.message || "Failed to update profile",
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

}
