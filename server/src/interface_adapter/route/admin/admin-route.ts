import { injectable } from "tsyringe";
import { asyncHandler } from "../../../shared/async-handler.js";
import { BaseRoute } from "../base-route.js";
import { adminUserController } from "../../../infrastructure/dependencyinjection/resolve.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { GetUsersRequestDTO } from "../../../application/dto/request/get-user-request-dto.js";
import { verifyAuth } from "../../middlewares/auth-middleware.js";
import { adminAuth } from "../../middlewares/adminAuth-middleware.js";

@injectable()
export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.get(
      "/users",
      asyncHandler(verifyAuth),
      adminAuth,
      validationMiddleware(GetUsersRequestDTO),
      asyncHandler(adminUserController.getUsers.bind(adminUserController))
    );

    this.router.get(
      "/users/:userId",
      asyncHandler(verifyAuth),
      adminAuth,
      asyncHandler(adminUserController.getUserDetails.bind(adminUserController))
    );

    this.router.patch(
      "/users/:userId/block",
      asyncHandler(verifyAuth),
      adminAuth,
      asyncHandler(adminUserController.blockUser.bind(adminUserController))
    );

    this.router.patch(
      "/users/:userId/unblock",
      asyncHandler(verifyAuth),
      adminAuth,
      asyncHandler(adminUserController.unblockUser.bind(adminUserController))
    );
  }
}
