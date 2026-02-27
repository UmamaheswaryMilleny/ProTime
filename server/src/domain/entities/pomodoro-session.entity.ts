export type PomodoroStatus = "started" | "paused" | "completed" | "stopped";

export interface IPomodoroSessionEntity {
  _id: string;
  userId: string;
  todoId: string;
  focusDuration:number;
  breakDuration:number;
  intervalsAt:number;
  status: PomodoroStatus;
  startedAt:Date;
  endedAt?: Date;
  xpEarned: number;
  createdAt: Date;
}
