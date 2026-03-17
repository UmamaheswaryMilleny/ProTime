import { injectable } from "tsyringe";
import { container } from "tsyringe";

import { BaseRoute } from "../base-route";
import { asyncHandler } from "../../../shared/asyncHandler";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { verifyAuth, authorizeRole } from "../../middlewares/auth.middleware";
import { ROUTES } from "../../../shared/constants/constants.routes";
import { AdminController } from "../../controllers/admin/admin-controller";
import { GetUsersRequestDTO } from "../../../application/dto/user/request/get-user.request.dto";
import { UserRole } from "../../../domain/enums/user.enums";

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
      ROUTES.ADMIN.USERS,
      validationMiddleware(GetUsersRequestDTO),
      asyncHandler(ctrl.getUsers.bind(ctrl)),
    );

    // Block a specific user
    this.router.patch(
      ROUTES.ADMIN.BLOCK_USER,
      asyncHandler(ctrl.blockUser.bind(ctrl)),
    );

    // Unblock a specific user
    this.router.patch(
      ROUTES.ADMIN.UNBLOCK_USER,
      asyncHandler(ctrl.unblockUser.bind(ctrl)),
    );
  }
}
