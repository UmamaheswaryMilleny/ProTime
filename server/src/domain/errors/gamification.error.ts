import { DomainError } from './base-domain.error';


// Thrown when no gamification document exists for the given userId.
export class GamificationNotFoundError extends DomainError {
    constructor() {
        super('Gamification profile not found');
    }
}


// Thrown when a BadgeDefinition with the given key or id does not exist.
export class BadgeDefinitionNotFoundError extends DomainError {
    constructor(key: string) {
        super(`Badge definition not found: ${key}`);
    }
}


// Thrown when trying to award a badge the user has already earned.
// Each badge can only be earned once per user.
export class BadgeAlreadyEarnedError extends DomainError {
    constructor(badgeKey: string) {
        super(`Badge already earned: ${badgeKey}`);
    }
}


export class PremiumBadgeRequiredError extends DomainError {
    constructor(badgeKey: string) {
        super(`Badge "${badgeKey}" requires a Premium subscription`);
    }
}


// Thrown when FREE user hits daily community chat message limit (10/day).
// Premium users have unlimited messages.
// export class DailyChatLimitError extends DomainError {
//     constructor() {
//         super('Daily message limit reached. Upgrade to Premium for unlimited messages.');
//     }
// }

// export class DailyXpCapReachedError extends DomainError {
//   constructor() {
//     super('Daily XP cap reached. Tasks still count but no XP until tomorrow.');
//   }
// }