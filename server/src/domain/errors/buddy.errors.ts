import { DomainError } from './base-domain.error';


export class BuddyMatchLimitError extends DomainError {
  constructor() {
    super('You have reached your monthly buddy match limit. Upgrade to Premium for unlimited matches');
  }
}


export class BuddyAlreadyConnectedError extends DomainError {
  constructor() {
    super('This user is already in your buddy list');
  }
}


export class BuddySelfMatchError extends DomainError {
  constructor() {
    super('You cannot match with yourself');
  }
}


export class BuddyNotFoundError extends DomainError {
  constructor() {
    super('Buddy connection not found');
  }
}


export class BuddyPreferenceNotFoundError extends DomainError {
  constructor() {
    super('Please set your buddy preferences before searching for matches');
  }
}


export class UnauthorizedBuddyActionError extends DomainError {
  constructor() {
    super('You are not authorized to perform this action on this request');
  }
}


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


export class InvalidSubjectDomainError extends DomainError {
  constructor() {
    super('Selected subject domain does not match your study goal');
  }
}


export class BuddyAlreadyBlockedError extends DomainError {
  constructor() {
    super('This user is already blocked');
  }
}


export class UnauthorizedUnblockError extends DomainError {
  constructor() {
    super('You can only unblock users that you have blocked');
  }
}