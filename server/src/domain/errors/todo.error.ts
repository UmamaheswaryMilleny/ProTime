import { DomainError } from './base-domain.error.js';

export class TodoNotFoundError extends DomainError {
  constructor() {
    super(`Todo not found`);
  }
}
export class TodoAlreadyCompletedError extends DomainError {
  constructor() {
    super(`This task had already been completed`);
  }
}
export class PomodoroNotEnabledError extends DomainError {
  constructor() {
    super(`Pomodoro timer is not enabled for this task`);
  }
}
export class PomodoroAlreadyCompletedError extends DomainError {
  constructor() {
    super(`Pomodoro session has already been completed for this task`);
  }
}
export class UnauthorizedTodoAccessError extends DomainError {
  constructor() {
    super(`You do not have permission to access this task`);
  }
}
export class InvalidEstimatedTimeError extends DomainError {
  constructor(priority:string,value:number) {
    super(`Estimated time ${value} is not valid for ${priority} priority`);
  }
}
// export class LowPriorityBreakTimeError extends DomainError {
//   constructor() {
//     super(`Break time is not available for LOW priority tasks`);
//   }
// }

// export class BreakTimeRequiredError extends DomainError {
//   constructor() {
//     super('Break time is required when Pomodoro is enabled for MEDIUM or HIGH priority tasks');
//   }
// }