export type XpSource =
  | "TASK"
  | "POMODORO"
  | "STREAK"
  | "BADGE";

export interface IXpTransactionEntity {
  _id: string;

  userId: string;

  source: XpSource;

  // Reference to what caused XP
  referenceId?: string; 
  // taskId | pomodoroSessionId | badgeId | streakId

  xpAmount: number;

  createdAt: Date;
}
