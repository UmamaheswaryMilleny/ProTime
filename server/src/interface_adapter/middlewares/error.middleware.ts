import type { NextFunction, Response, Request } from 'express';

import { DomainError } from '../../domain/errors/base-domain.error';
import { logger } from '../../infrastructure/config/logger.config';

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
  TodoExpiredError
} from '../../domain/errors/todo.error';

import { ProfileNotFoundError } from '../../domain/errors/profile.error';

// ─── Gamification errors ───────────────────────────────────────────────────
import {
  GamificationNotFoundError,
  BadgeDefinitionNotFoundError,
  BadgeAlreadyEarnedError,
  PremiumBadgeRequiredError,
} from '../../domain/errors/gamification.error';

import {
  CommunityMessageLimitError,
  EmptyMessageContentError,
} from '../../domain/errors/community.errors';

import { HTTP_STATUS } from '../../shared/constants/constants';


// ─── Subscription errors ───────────────────────────────────────────────────
import {
  SubscriptionNotFoundError,
  AlreadyPremiumError,
  SubscriptionNotCancellableError,
  InvalidWebhookSignatureError,
} from '../../domain/errors/subscription.error';

// ─── Buddy match errors ────────────────────────────────────────────────────
import {
  BuddyMatchLimitError,
  UnauthorizedBuddyActionError,
  BuddyNotFoundError,
  BuddyPreferenceNotFoundError,
  BuddyAlreadyConnectedError,
  BuddySelfMatchError,
  BuddyRequestAlreadyRespondedError,
  InvalidSubjectDomainError,
  BuddyAlreadyBlockedError,
  UnauthorizedUnblockError,
} from '../../domain/errors/buddy.errors';

// ─── Chat errors ───────────────────────────────────────────────────────────
import {
  ConversationNotFoundError,
  MessageNotFoundError,
  NotABuddyError,
  UnauthorizedMessageError,
  SessionAlreadyActiveError,
  SessionNotActiveError,
} from '../../domain/errors/chat.errors';

//report errors

// ─── Report errors ─────────────────────────────────────────────────────────
import {
  ReportValidationError,
  SelfReportError,
  ReportNotFoundError,
  DuplicateReportError,ReportAlreadyResolvedError,
} from '../../domain/errors/report.errors';

// ─── Calendar errors ───────────────────────────────────────────────────────
import {
  SessionNotFoundError,
  CalendarEventNotFoundError,
  ScheduleRequestNotFoundError,
  UnauthorizedSessionActionError,
  BuddySessionAlreadyActiveError,
  BuddySessionNotActiveError,
  NotInActiveSessionError,
  ScheduleRequestAlreadyRespondedError,
} from '../../domain/errors/calendar.error';



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
      err instanceof BadgeDefinitionNotFoundError || err instanceof SubscriptionNotFoundError ||
      err instanceof BuddyNotFoundError ||        // ← add
      err instanceof BuddyPreferenceNotFoundError || err instanceof ConversationNotFoundError ||
      err instanceof MessageNotFoundError || err instanceof ReportNotFoundError || err instanceof SessionNotFoundError      ||
err instanceof CalendarEventNotFoundError ||
err instanceof ScheduleRequestNotFoundError
    ) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: err.message });
      return;
    }

    // ─── 409 Conflict ─────────────────────────────────────────────────
    if (
      err instanceof UserAlreadyExistsError ||
      err instanceof BadgeAlreadyEarnedError || err instanceof AlreadyPremiumError || err instanceof DuplicateReportError
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
      err instanceof CommunityMessageLimitError || err instanceof BuddyMatchLimitError ||       // ← add
      err instanceof UnauthorizedBuddyActionError || err instanceof NotABuddyError ||
      err instanceof UnauthorizedMessageError || err instanceof UnauthorizedSessionActionError
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
      err instanceof InvalidEstimatedTimeError || err instanceof SubscriptionNotCancellableError ||
      err instanceof BuddyAlreadyConnectedError ||  // ← add
      err instanceof BuddySelfMatchError ||  // ← add
      err instanceof BuddyRequestAlreadyRespondedError || // ← add
      err instanceof InvalidSubjectDomainError ||
      err instanceof BuddyAlreadyBlockedError ||
      err instanceof UnauthorizedUnblockError ||
      err instanceof EmptyMessageContentError || err instanceof SessionAlreadyActiveError ||
      err instanceof SessionNotActiveError || err instanceof ReportValidationError || err instanceof SelfReportError || err instanceof ReportAlreadyResolvedError || err instanceof BuddySessionAlreadyActiveError    ||
err instanceof BuddySessionNotActiveError        ||
err instanceof NotInActiveSessionError           ||
err instanceof ScheduleRequestAlreadyRespondedError
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
    logger.error('[Internal Server Error]:', { error: err });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}