import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../../infrastructure/service/token-service.js";
import { redisClient } from "../../infrastructure/config/redisConfig.js";
import {
  COOKIES_NAMES,
  ERROR_MESSAGE,
  HTTP_STATUS,
} from "../../shared/constants/constants.js";

const tokenService = new TokenService();



export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedUser extends CustomJwtPayload {
  accessToken: string;
  refreshToken: string;
}


export interface CustomRequest extends Request {
  user?: AuthenticatedUser;
}




export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    const accessToken =
      req.cookies[COOKIES_NAMES.ACCESS_TOKEN] ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined);

    const refreshToken = req.cookies[COOKIES_NAMES.REFRESH_TOKEN];

   

    if (!accessToken) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
      });
      return;
    }




    const payload = tokenService.verifyAccessToken(
      accessToken
    ) as CustomJwtPayload | null;

    if (!payload || !payload.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
      });
      return;
    }

    (req as CustomRequest).user = {
      ...payload,
      accessToken,
      refreshToken: refreshToken || "",
    };

    next();
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError")
    ) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.TOKEN_EXPIRED_ACCESS,
      });
      return;
    }

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGE.AUTHENTICATION.INVALID_TOKEN,
    });
  }
};




export const decodeToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies[COOKIES_NAMES.ACCESS_TOKEN];

    if (!token) {
      next();
      return;
    }


    const payload = tokenService.decodeAcessToken(
      token
    ) as CustomJwtPayload | null;

    if (payload?.id) {
      (req as CustomRequest).user = {
        id: payload.id,
        email: payload.email || "",
        role: payload.role || "",
        accessToken: token,
        refreshToken: req.cookies[COOKIES_NAMES.REFRESH_TOKEN] || "",
      };
    }

    next();
  } catch {
    next();
  }
};


export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as CustomRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGE.AUTHENTICATION.FORBIDDEN,
        userRole: user?.role ?? "None",
      });
      return;
    }

    next();
  };
};