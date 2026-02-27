import { CustomError } from "./customError.js";

export class PremiumRequiredForBadgeError extends CustomError {
  constructor() {
    super(403, "Premium subscription required to unlock this badge");
  }
}

export class BadgeAlreadyUnlockedError extends CustomError {
  constructor() {
    super(400, "Badge already unlocked");
  }
}
