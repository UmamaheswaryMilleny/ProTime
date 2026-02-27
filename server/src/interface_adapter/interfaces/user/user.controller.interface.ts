import type { Response, NextFunction } from "express";
import type { CustomRequest } from "../../middlewares/auth.middleware.js";

export interface IUserController {
  getProfile(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateProfile(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
