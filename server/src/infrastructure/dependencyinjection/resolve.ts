import { container } from "tsyringe";
import { DependencyInjection } from "./index.js";
import type { IErrorMiddleware } from "../../interface_adapter/interfaces/auth/error-middleware-interface.js";
import { ErrorMiddleware } from "../../interface_adapter/middlewares/error-middleware.js";
import { AuthController } from "../../interface_adapter/controllers/auth/auth-controller.js";
import type { IAuthController } from "../../interface_adapter/interfaces/auth/auth-controller-interface.js";
import { AuthRoutes } from "../../interface_adapter/route/auth/auth.js";
import { AdminUserController } from "../../interface_adapter/controllers/admin/admin-user-controller.js";
import type { IAdminUserController } from "../../interface_adapter/interfaces/admin/admin-user-controller-interface.js";
import { AdminRoutes } from "../../interface_adapter/route/admin/admin-route.js";
import type { IBlockedUserMiddleware } from "../../interface_adapter/interfaces/user/blocked-user-middleware-interface.js";
import { BlockedUserMiddleware } from "../../interface_adapter/middlewares/block-middleware.js";
import { UserRoutes } from "../../interface_adapter/route/user/user-route.js";
import { UserController } from "../../interface_adapter/controllers/user/user-profile-controller.js";
import type { IUserController } from "../../interface_adapter/interfaces/user/user-profile-controller-interface.js";

DependencyInjection.registerAll();

export const errorMiddleware =
  container.resolve<IErrorMiddleware>(ErrorMiddleware);

  /**
 * Blocked user middleware
 */
export const blockedUserMiddleware = container.resolve<IBlockedUserMiddleware>(
  BlockedUserMiddleware
);

export const userController =
  container.resolve<IUserController>(UserController);


/**
 * Auth controller
 */
export const authController =
  container.resolve<IAuthController>(AuthController);



/**
 * Auth routes
 */
export const authRoutes = container.resolve(AuthRoutes);

/**
 * Admin User controller
 */
export const adminUserController =
  container.resolve<IAdminUserController>(AdminUserController);

/**
 * Admin routes
 */
export const adminRoutes = container.resolve(AdminRoutes);



/**
 * User routes
 */
export const userRoutes = container.resolve(UserRoutes);