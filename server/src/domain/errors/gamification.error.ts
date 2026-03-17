import { DomainError } from './base-domain.error';



export class GamificationNotFoundError extends DomainError {
    constructor() {
        super('Gamification profile not found');
    }
}



export class BadgeDefinitionNotFoundError extends DomainError {
    constructor(key: string) {
        super(`Badge definition not found: ${key}`);
    }
}



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



// export class DailyXpCapReachedError extends DomainError {
//   constructor() {
//     super('Daily XP cap reached. Tasks still count but no XP until tomorrow.');
//   }
// }