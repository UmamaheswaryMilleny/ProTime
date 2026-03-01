import type { Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import type { IUserController } from "../../interfaces/user/user.controller.interface";
import type { IProfileRepository } from "../../../domain/repositories/profile/profile.repository.interface";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";
import { ProfileMapper } from "../../../application/mapper/profile.mapper";
import { ResponseHelper } from "../../helpers/response.helper";
import { HTTP_STATUS } from "../../../shared/constants/constants";
import type { CustomRequest } from "../../middlewares/auth.middleware";
import type { IUploadProfileImageUsecase } from "../../../application/usecase/interface/user/image.usecase.interface";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,

    @inject("ProfileRepository")
    private readonly profileRepository: IProfileRepository,
    @inject('IUploadProfileImageUsecase')
private readonly uploadProfileImageUsecase: IUploadProfileImageUsecase
  ) {}

  // ─── Get Profile ──────────────────────────────────────────────────────────

  async getProfile(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const [user, profile] = await Promise.all([
        this.userRepository.findById(req.user.id),
        this.profileRepository.findByUserId(req.user.id),
      ]);

      if (!user) {
        ResponseHelper.error(res, "User not found", HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (!profile) {
        ResponseHelper.error(res, "Profile not found", HTTP_STATUS.NOT_FOUND);
        return;
      }

      // ProfileMapper.toProfileResponse takes both profile + user info
      const profileDTO = ProfileMapper.toProfileResponse(profile, {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      });

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        "Profile retrieved successfully",
        profileDTO,
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Update Profile ───────────────────────────────────────────────────────

  async updateProfile(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const { fullName, username, bio, country, profileImage } = req.body;

      // Check username uniqueness if username is being changed
      if (username) {
        const isTaken = await this.profileRepository.existsByUsername(
          username,
          req.user.id, // excludes current user from uniqueness check
        );

        if (isTaken) {
          ResponseHelper.error(
            res,
            "Username is already taken",
            HTTP_STATUS.CONFLICT,
          );
          return;
        }
      }

      const updatedProfile = await this.profileRepository.updateByUserId(
        req.user.id,
        { fullName: fullName, username, bio, country, profileImage },
      );

      if (!updatedProfile) {
        ResponseHelper.error(res, "Profile not found", HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Fetch user for the mapper
      const user = await this.userRepository.findById(req.user.id);

      if (!user) {
        ResponseHelper.error(res, "User not found", HTTP_STATUS.NOT_FOUND);
        return;
      }

      const profileDTO = ProfileMapper.toProfileResponse(updatedProfile, {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      });

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        "Profile updated successfully",
        profileDTO,
      );
    } catch (error) {
      next(error);
    }
  }



async uploadAvatar(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    // multer puts the file in req.file — no file means middleware let it through empty
    if (!req.file) {
      ResponseHelper.error(res, 'No image file provided', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const result = await this.uploadProfileImageUsecase.execute(
      req.user.id,
      req.file.buffer,
      req.file.mimetype,
    );

    ResponseHelper.success(res, HTTP_STATUS.OK, 'Profile image updated successfully', result);
  } catch (error) {
    next(error);
  }
}


}
