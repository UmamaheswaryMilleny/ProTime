import { injectable } from "tsyringe";
import { container } from "tsyringe";

import { BaseRoute } from "../base-route.js";
import { asyncHandler } from "../../../shared/asyncHandler.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { verifyAuth, authorizeRole } from "../../middlewares/auth.middleware.js";
import { AdminController } from "../../controllers/admin/admin-controller.js";
import { GetUsersRequestDTO } from "../../../application/dto/user/request/get-user.request.dto.js";
import { UserRole } from "../../../domain/enums/user.enums.js";

@injectable()
export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(AdminController);

    // All admin routes require authentication + ADMIN role
    // verifyAuth   → validates JWT, attaches req.user
    // authorizeRole → checks role === ADMIN, rejects CLIENT
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.ADMIN]));

    // ─── User Management ──────────────────────────────────────────────

    // Get all users with search, filter, pagination, sort
    this.router.get(
      "/users",
      validationMiddleware(GetUsersRequestDTO),
      asyncHandler(ctrl.getUsers.bind(ctrl)),
    );

    // Block a specific user
    this.router.patch(
      "/users/:userId/block",
      asyncHandler(ctrl.blockUser.bind(ctrl)),
    );

    // Unblock a specific user
    this.router.patch(
      "/users/:userId/unblock",
      asyncHandler(ctrl.unblockUser.bind(ctrl)),
    );
  }
}
