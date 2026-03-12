import type { NextFunction, Response, Request } from 'express';

import { DomainError } from '../../domain/errors/base-domain.error';

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
  RegistrationSessionExpiredError,
} from '../../domain/errors/user.error';

// ─── Todo errors ───────────────────────────────────────────────────────────
import {
  TodoNotFoundError,
  TodoAlreadyCompletedError,
  UnauthorizedTodoAccessError,
  PomodoroNotEnabledError,
  PomodoroAlreadyCompletedError,
  InvalidEstimatedTimeError,
  TodoExpiredError,
} from '../../domain/errors/todo.error';

import { ProfileNotFoundError } from '../../domain/errors/profile.error';

// ─── Gamification errors ───────────────────────────────────────────────────
import {
  GamificationNotFoundError,
  BadgeDefinitionNotFoundError,
  BadgeAlreadyEarnedError,
  PremiumBadgeRequiredError,
  DailyChatLimitError,
} from '../../domain/errors/gamification.error';

import { HTTP_STATUS } from '../../shared/constants/constants';


// ─── Subscription errors ───────────────────────────────────────────────────
import {
  SubscriptionNotFoundError,
  AlreadyPremiumError,
  SubscriptionNotCancellableError,
  InvalidWebhookSignatureError,
} from '../../domain/errors/subscription.error';

export class ErrorMiddleware {
  public handleError(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {

    // ─── 404 Not Found ────────────────────────────────────────────────
    if (
      err instanceof UserNotFoundError ||
      err instanceof TodoNotFoundError ||
      err instanceof ProfileNotFoundError ||
      err instanceof GamificationNotFoundError ||
      err instanceof BadgeDefinitionNotFoundError || err instanceof SubscriptionNotFoundError
    ) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: err.message });
      return;
    }

    // ─── 409 Conflict ─────────────────────────────────────────────────
    if (
      err instanceof UserAlreadyExistsError ||
      err instanceof BadgeAlreadyEarnedError || err instanceof AlreadyPremiumError
    ) {
      res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: err.message });
      return;
    }

    // ─── 403 Forbidden ────────────────────────────────────────────────
    if (
      err instanceof UserBlockedError ||
      err instanceof UserDeletedError ||
      err instanceof UnauthorizedTodoAccessError ||
      err instanceof PremiumBadgeRequiredError ||
      err instanceof DailyChatLimitError
    ) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: err.message });
      return;
    }

    // ─── 401 Unauthorized ─────────────────────────────────────────────
    if (
      err instanceof InvalidPasswordError ||
      err instanceof InvalidTokenError || err instanceof InvalidWebhookSignatureError
    ) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: err.message });
      return;
    }

    // ─── 400 Bad Request ──────────────────────────────────────────────
    if (
      err instanceof InvalidOtpError ||
      err instanceof WeakPasswordError ||
      err instanceof PasswordMismatchError ||
      err instanceof RegistrationSessionExpiredError ||
      err instanceof TodoAlreadyCompletedError ||
      err instanceof TodoExpiredError ||
      err instanceof PomodoroNotEnabledError ||
      err instanceof PomodoroAlreadyCompletedError ||
      err instanceof InvalidEstimatedTimeError || err instanceof SubscriptionNotCancellableError
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
    console.error('[Internal Server Error]:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}