import { DomainError } from './base-domain.error';

// ─── 404 ──────────────────────────────────────────────────────────────────────
export class SessionNotFoundError extends DomainError {
  constructor() {
    super('Session not found');
  }
}

export class CalendarEventNotFoundError extends DomainError {
  constructor() {
    super('Calendar event not found');
  }
}

export class ScheduleRequestNotFoundError extends DomainError {
  constructor() {
    super('Schedule request not found');
  }
}

// ─── 403 ──────────────────────────────────────────────────────────────────────
export class UnauthorizedSessionActionError extends DomainError {
  constructor() {
    super('You are not authorized to perform this action on this session');
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
// Renamed from SessionAlreadyActiveError to avoid collision with chat.errors.ts
export class BuddySessionAlreadyActiveError extends DomainError {
  constructor() {
    super('A session is already active in this conversation');
  }
}

// Renamed from SessionNotActiveError to avoid collision with chat.errors.ts
export class BuddySessionNotActiveError extends DomainError {
  constructor() {
    super('No active session found in this conversation');
  }
}

export class NotInActiveSessionError extends DomainError {
  constructor() {
    super('You can only schedule the next session during an active session');
  }
}

export class ScheduleRequestAlreadyRespondedError extends DomainError {
  constructor() {
    super('This schedule request has already been responded to');
  }
}
