import { CustomError } from "./customError.js";

export class PomodoroTooShortError extends CustomError {
  constructor() {
    super(400, "Pomodoro duration is too short to earn XP");
  }
}

export class PomodoroAlreadyCompletedError extends CustomError {
  constructor() {
    super(400, "Pomodoro session already completed");
  }
}
