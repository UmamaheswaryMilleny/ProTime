import { DomainError } from './base-domain.error';

// ─── 404 ──────────────────────────────────────────────────────────────────────
// Every user gets a subscription row on signup — this signals a data integrity issue
export class SubscriptionNotFoundError extends DomainError {
  constructor() {
    super('Subscription not found');
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
// User tries to start checkout but is already on ACTIVE PREMIUM
export class AlreadyPremiumError extends DomainError {
  constructor() {
    super('You already have an active premium subscription');
  }
}

// User tries to cancel but nothing is cancellable (FREE plan or already CANCELLED)
export class SubscriptionNotCancellableError extends DomainError {
  constructor() {
    super('No active premium subscription to cancel');
  }
}

// Stripe webhook signature check failed — request did not come from Stripe
export class InvalidWebhookSignatureError extends DomainError {
  constructor() {
    super('Invalid webhook signature');
  }
}