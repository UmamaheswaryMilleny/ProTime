export interface IStreakEntity {
  _id: string;

  userId: string;

  currentStreak: number;

  longestStreak: number;

  lastActiveDate: Date;

  createdAt: Date;
  updatedAt: Date;
}
