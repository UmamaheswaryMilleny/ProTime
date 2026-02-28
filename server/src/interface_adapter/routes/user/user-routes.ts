import { injectable } from "tsyringe";
import { container } from "tsyringe";

import { BaseRoute } from "../base-route";
import { asyncHandler } from "../../../shared/asyncHandler";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { verifyAuth, authorizeRole } from "../../middlewares/auth.middleware";
import { BlockedUserMiddleware } from "../../middlewares/blocked-user.middleware";
import { UserController } from "../../controllers/user/user-controller";
import { UpdateProfileRequestDTO } from "../../../application/dto/user/request/update-profile.request.dto";
import { UserRole } from "../../../domain/enums/user.enums";

@injectable()
export class UserRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(UserController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    // All user routes require:
    // 1. verifyAuth       → valid JWT + attaches req.user
    // 2. authorizeRole    → must be CLIENT role
    // 3. checkBlockedUser → DB check that user is not blocked
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // ─── Profile Routes ───────────────────────────────────────────────

    // Get own profile
    this.router.get("/profile", asyncHandler(ctrl.getProfile.bind(ctrl)));

    // Update own profile
    this.router.put(
      "/profile",
      validationMiddleware(UpdateProfileRequestDTO),
      asyncHandler(ctrl.updateProfile.bind(ctrl)),
    );
  }
}
