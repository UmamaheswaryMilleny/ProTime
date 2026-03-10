import { TodoPriority, TodoStatus } from '../enums/todo.enums';

export interface TodoEntity {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  estimatedTime: number;
  status: TodoStatus;

  pomodoroEnabled: boolean;
  pomodoroCompleted: boolean;
  actualPomodoroTime: number | null;
  // breakTime?: number;
  smartBreaks: boolean | null;
  completedAt: Date | null;
  expiryDate: Date | null;
  baseXp: number;
  bonusXp: number;
  xpCounted: boolean;

  // isShared: boolean;
  sharedWith: string[];

  createdAt: Date;
  updatedAt: Date;
}
