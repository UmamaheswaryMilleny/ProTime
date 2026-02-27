export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITaskEntity {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedMinutes?: number;
  isCompleted: boolean;
  sharedTo: boolean;
  pomodoroEnabled: boolean;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}
