import type { NextFunction, Response, Request } from 'express';

import { DomainError } from '../../domain/errors/base-domain.error.js';

// ─── User errors ───────────────────────────────────────────────────────────
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

// ─── Todo errors ───────────────────────────────────────────────────────────
import {
  TodoNotFoundError,
  TodoAlreadyCompletedError,
  UnauthorizedTodoAccessError,
  PomodoroNotEnabledError,
  PomodoroAlreadyCompletedError,
  InvalidEstimatedTimeError,
} from '../../domain/errors/todo.error.js';

import { HTTP_STATUS } from '../../shared/constants/constants.js';

export class ErrorMiddleware {
  public handleError(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {

    // ─── 404 Not Found ────────────────────────────────────────────────
    if (
      err instanceof UserNotFoundError ||
      err instanceof TodoNotFoundError
    ) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: err.message });
      return;
    }

    // ─── 409 Conflict ─────────────────────────────────────────────────
    if (err instanceof UserAlreadyExistsError) {
      res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: err.message });
      return;
    }

    // ─── 403 Forbidden ────────────────────────────────────────────────
    if (
      err instanceof UserBlockedError ||
      err instanceof UserDeletedError ||
      err instanceof UnauthorizedTodoAccessError  // user trying to edit/delete someone else's todo
    ) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: err.message });
      return;
    }

    // ─── 401 Unauthorized ─────────────────────────────────────────────
    if (
      err instanceof InvalidPasswordError ||
      err instanceof InvalidTokenError
    ) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: err.message });
      return;
    }

    // ─── 400 Bad Request ──────────────────────────────────────────────
    if (
      err instanceof InvalidOtpError ||
      err instanceof WeakPasswordError ||
      err instanceof PasswordMismatchError ||
      err instanceof TodoAlreadyCompletedError ||
      err instanceof PomodoroNotEnabledError ||
      err instanceof PomodoroAlreadyCompletedError ||
      err instanceof InvalidEstimatedTimeError
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: err.message });
      return;
    }

    // ─── Any other DomainError not explicitly mapped ───────────────────
    if (err instanceof DomainError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: err.message });
      return;
    }

    // ─── Unknown / unexpected errors ──────────────────────────────────
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}