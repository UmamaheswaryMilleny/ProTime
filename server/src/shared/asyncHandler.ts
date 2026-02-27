import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * asyncHandler — wraps async Express route handlers
 * Catches any unhandled promise rejections and passes them to next(error)
 * This ensures all domain errors reach ErrorMiddleware automatically
 *
 * Usage:
 *   router.post('/login', asyncHandler(ctrl.login.bind(ctrl)))
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
