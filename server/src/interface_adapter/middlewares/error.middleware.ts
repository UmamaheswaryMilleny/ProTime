import type { NextFunction, Response, Request } from 'express';

import { DomainError } from '../../domain/errors/base-domain.error.js';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  UserBlockedError,
  UserDeletedError,
  InvalidPasswordError,
  InvalidOtpError,
  InvalidTokenError,
  WeakPasswordError,
  PasswordMismatchError,
} from '../../domain/errors/user.error.js';
import { HTTP_STATUS } from '../../shared/constants/constants.js';

export class ErrorMiddleware {
  /**
   * handleError — Express global error handler
   * Maps every domain error to the correct HTTP status code
   * Must be registered LAST in Express middleware chain
   * Signature must have 4 params for Express to treat it as error handler
   */
  public handleError(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {

    // ─── 404 Not Found ────────────────────────────────────────────────
    if (err instanceof UserNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── 409 Conflict ─────────────────────────────────────────────────
    if (err instanceof UserAlreadyExistsError) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── 403 Forbidden ────────────────────────────────────────────────
    if (err instanceof UserBlockedError || err instanceof UserDeletedError) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── 401 Unauthorized ─────────────────────────────────────────────
    if (
      err instanceof InvalidPasswordError ||
      err instanceof InvalidTokenError
    ) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── 400 Bad Request ──────────────────────────────────────────────
    if (
      err instanceof InvalidOtpError ||
      err instanceof WeakPasswordError ||
      err instanceof PasswordMismatchError
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── Any other DomainError not explicitly mapped ───────────────────
    if (err instanceof DomainError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message,
      });
      return;
    }

    // ─── Unknown / unexpected errors ──────────────────────────────────
    // Never leak internal error details to client
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}