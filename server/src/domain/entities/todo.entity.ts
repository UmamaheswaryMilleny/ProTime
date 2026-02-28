import { TodoPriority, TodoStatus } from '../enums/todo.enums.js';

export interface TodoEntity {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  estimatedTime: number;
  status: TodoStatus;
  
  pomodoroEnabled: boolean;
  pomodoroCompleted: boolean;
  actualPomodoroTime?:number;
  // breakTime?: number;
  smartBreaks?: boolean;
  completedAt?: Date;

  baseXp: number;
  bonusXp: number;
  xpCounted: boolean;

  isShared: boolean;
  sharedWith?: string[];

  createdAt: Date;
  updatedAt: Date;
}

