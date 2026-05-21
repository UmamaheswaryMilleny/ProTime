import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * asyncHandler — wraps async Express route handlers.
 *
 * Catches any unhandled promise rejections (including non-Error throws) and
 * passes them straight to next(error), so all thrown values reach the global
 * ErrorMiddleware which normalises them via toError().
 *
 * Usage:
 *   router.post('/login', asyncHandler(ctrl.login.bind(ctrl)))
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch((err: unknown) => next(err));
  };
};
