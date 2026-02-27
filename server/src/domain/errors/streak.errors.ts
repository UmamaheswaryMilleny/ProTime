import { CustomError } from "./customError.js";

export class StreakBrokenError extends CustomError {
  constructor() {
    super(400, "Streak broken due to inactivity");
  }
}

export class PomodoroRequiredForStreakError extends CustomError {
  constructor() {
    super(400, "Pomodoro usage required to maintain streak");
  }
}
