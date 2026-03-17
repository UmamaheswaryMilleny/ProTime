import { DomainError } from './base-domain.error';


export class SubscriptionNotFoundError extends DomainError {
  constructor() {
    super('Subscription not found');
  }
}


export class AlreadyPremiumError extends DomainError {
  constructor() {
    super('You already have an active premium subscription');
  }
}


export class SubscriptionNotCancellableError extends DomainError {
  constructor() {
    super('No active premium subscription to cancel');
  }
}


export class InvalidWebhookSignatureError extends DomainError {
  constructor() {
    super('Invalid webhook signature');
  }
}