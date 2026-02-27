import { CustomError } from "./customError.js";

export class PremiumSubscriptionRequiredError extends CustomError {
  constructor() {
    super(403, "Premium subscription required to access this feature");
  }
}

export class SubscriptionExpiredError extends CustomError {
  constructor() {
    super(403, "Your subscription has expired");
  }
}

export class StudyRoomCreationNotAllowedError extends CustomError {
  constructor() {
    super(403, "Study room creation is not allowed for trial users");
  }
}

export class StudyRoomJoinLimitExceededError extends CustomError {
  constructor() {
    super(400, "Trial users can join only 2 study rooms");
  }
}

export class BuddyMatchLimitExceededError extends CustomError {
  constructor() {
    super(400, "Trial users can have only 10 buddy matches");
  }
}

export class ProBuddyTokenLimitExceededError extends CustomError {
  constructor() {
    super(400, "ProBuddy token limit exceeded for trial users");
  }
}

export class ReportDownloadNotAllowedError extends CustomError {
  constructor() {
    super(403, "Progress report download is available only for premium users");
  }
}
