import { inject, injectable } from "tsyringe";
import { BaseRoute } from "../base-route.js";
import { verifyAuth } from "../../middlewares/auth-middleware.js";
import { asyncHandler } from "../../../shared/async-handler.js";
import {
  blockedUserMiddleware,
  userController,
} from "../../../infrastructure/dependencyinjection/resolve.js";

@injectable()
export class UserRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.use(verifyAuth);
    this.router.use(blockedUserMiddleware.checkBlockedUser);

    this.router.get(
      "/profile",
      asyncHandler(userController.getProfile.bind(userController))
    );
  }
}