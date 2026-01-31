// asyncHandler = try/catch for every async route, written once.You write it one time, use it everywhere.
import type{ Request, Response, NextFunction } from "express";
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};