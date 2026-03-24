import { DomainError } from './base-domain.error';

// ─── 400 ──────────────────────────────────────────────────────────────────────
export class ReportValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class SelfReportError extends DomainError {
  constructor() {
    super('You cannot report yourself');
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────────────
export class ReportNotFoundError extends DomainError {
  constructor() {
    super('Report not found');
  }
}

// ─── 409 ──────────────────────────────────────────────────────────────────────
// Only blocks duplicate if a PENDING report already exists —
// user can report the same person again after previous report is resolved
export class DuplicateReportError extends DomainError {
  constructor() {
    super('You already have a pending report against this user');
  }
}