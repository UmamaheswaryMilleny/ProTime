import type{ Request, Response, NextFunction } from "express";

export interface IBlockedUserMiddleware {
  checkBlockedUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}