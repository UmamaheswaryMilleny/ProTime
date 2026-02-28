import type { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import type { ITokenService } from "../../application/service_interface/token.service.interface";
import {
  COOKIES_NAMES,
  ERROR_MESSAGE,
  HTTP_STATUS,
} from "../../shared/constants/constants";

// ─── Extended Request Type ────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface CustomRequest extends Request {
  user?: AuthenticatedUser;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * verifyAuth — validates access token from cookie or Authorization header
 * Attaches decoded user payload to req.user
 */
export const verifyAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const tokenService = container.resolve<ITokenService>("ITokenService");

    const authHeader = req.headers.authorization;

    // Accept token from cookie OR Authorization: Bearer <token>
    const accessToken =
      req.cookies[COOKIES_NAMES.ACCESS_TOKEN] ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined);

    const refreshToken = req.cookies[COOKIES_NAMES.REFRESH_TOKEN] ?? "";

    if (!accessToken) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.TOKEN_MISSING,
      });
      return;
    }

    // verifyAccess returns null if invalid or expired — never throws
    const payload = tokenService.verifyAccess(accessToken);

    if (!payload || !payload.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.INVALID_TOKEN,
      });
      return;
    }

    (req as CustomRequest).user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      accessToken,
      refreshToken,
    };

    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
    });
  }
};

/**
 * authorizeRole — checks req.user.role against allowed roles
 * Must be used AFTER verifyAuth
 * Replaces the separate adminAuth middleware — works for any role
 *
 * Usage:
 *   router.get('/admin/users', verifyAuth, authorizeRole(['ADMIN']), handler)
 *   router.get('/profile',     verifyAuth, authorizeRole(['CLIENT', 'ADMIN']), handler)
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as CustomRequest).user;

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.FORBIDDEN,
      });
      return;
    }

    next();
  };
};
