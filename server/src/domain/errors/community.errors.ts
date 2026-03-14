import { DomainError } from './base-domain.error';

// ─── 403 ──────────────────────────────────────────────────────────────────────
export class CommunityMessageLimitError extends DomainError {
  constructor() {
    super('You have reached your monthly community chat limit. Upgrade to Premium for unlimited messages');
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
export class EmptyMessageContentError extends DomainError {
  constructor() {
    super('Message content cannot be empty');
  }
}