import { inject, injectable } from "tsyringe";
import { BaseRoute } from "../base-route.js";
import { verifyAuth } from "../../middlewares/auth-middleware.js";
import { asyncHandler } from "../../../shared/async-handler.js";
import {
  blockedUserMiddleware,
  userController,
  profileUploadController,
} from "../../../infrastructure/dependencyinjection/resolve.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { UpdateUserProfileRequestDTO } from "../../../application/dto/request/update-userprofile-request.dto.js";

@injectable()
export class UserRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.use(verifyAuth);
    this.router.use(
      blockedUserMiddleware.checkBlockedUser.bind(blockedUserMiddleware)
    );

    // Profile routes
    this.router.get(
      "/profile",
      asyncHandler(userController.getProfile.bind(userController))
    );

    this.router.put(
      "/profile",
      validationMiddleware(UpdateUserProfileRequestDTO),
      asyncHandler(userController.updateProfile.bind(userController))
    );

    // Upload profile image (USE MULTER SERVICE)
    this.router.post(
      "/upload/profile-image",
      profileUploadController.uploadMiddleware(), // 🔥 MULTER HERE
      asyncHandler(
        profileUploadController.uploadProfileImage.bind(profileUploadController)
      )
    );
  }
}
