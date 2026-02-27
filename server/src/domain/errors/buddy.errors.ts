import { CustomError } from "./customError.js";

export class CannotMatchWithSelfError extends CustomError {
  constructor() {
    super(400, "You cannot match with yourself");
  }
}

export class BuddyMatchAlreadyExistsError extends CustomError {
  constructor() {
    super(400, "Buddy match already exists");
  }
}

export class InvalidBuddyRatingError extends CustomError {
  constructor() {
    super(400, "Buddy session rating must be between 1 and 5");
  }
}
