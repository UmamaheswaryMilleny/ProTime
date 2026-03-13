import { DomainError } from './base-domain.error';

// ─── 403 ──────────────────────────────────────────────────────────────────────
// Free user has made 5 accepted connections in the current 30-day window.
// Quota is consumed on accept, not on search.
export class BuddyMatchLimitError extends DomainError {
  constructor() {
    super('You have reached your monthly buddy match limit. Upgrade to Premium for unlimited matches');
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
// User tries to send a request to someone already in their buddy list
export class BuddyAlreadyConnectedError extends DomainError {
  constructor() {
    super('This user is already in your buddy list');
  }
}

// User tries to connect with themselves
export class BuddySelfMatchError extends DomainError {
  constructor() {
    super('You cannot match with yourself');
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────────────
// Buddy connection record not found
export class BuddyNotFoundError extends DomainError {
  constructor() {
    super('Buddy connection not found');
  }
}

// User tries to search without having set preferences first
export class BuddyPreferenceNotFoundError extends DomainError {
  constructor() {
    super('Please set your buddy preferences before searching for matches');
  }
}

// ─── 403 ──────────────────────────────────────────────────────────────────────
// Receiver is not the intended target of this connection request
export class UnauthorizedBuddyActionError extends DomainError {
  constructor() {
    super('You are not authorized to perform this action on this request');
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
// Connection is no longer PENDING — already accepted, declined, or blocked
export class BuddyRequestAlreadyRespondedError extends DomainError {
  constructor() {
    super('This buddy request has already been responded to');
  }
}

// // Free user attempted to use advanced matching filters
// export class AdvancedFilterNotAllowedError extends DomainError {
//   constructor() {
//     super('Advanced filters are a Premium feature. Upgrade to access subject, availability, and more filters');
//   }
// }