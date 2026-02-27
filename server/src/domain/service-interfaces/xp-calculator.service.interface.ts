import type { TaskPriority } from "../entities/task.entity.js";

export interface IXpCalculator {
  calculateTaskXp(priority: TaskPriority, pomodoroUsed: boolean): number;

  calculateStreakXp(streakDays: number): number;

  badgeXp(): number; // always 50
}
