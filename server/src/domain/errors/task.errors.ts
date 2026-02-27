import { CustomError } from "./customError.js";

export class DailyTaskLimitExceededError extends CustomError {
  constructor() {
    super(400, "Daily XP task limit exceeded (max 10 tasks per day)");
  }
}

export class MediumPriorityLimitExceededError extends CustomError {
  constructor() {
    super(400, "Only 3 medium-priority tasks can earn XP per day");
  }
}

export class HighPriorityLimitExceededError extends CustomError {
  constructor() {
    super(400, "Only 3 high-priority tasks can earn XP per day");
  }
}

export class TaskAlreadyCompletedError extends CustomError {
  constructor() {
    super(400, "Task is already completed");
  }
}
