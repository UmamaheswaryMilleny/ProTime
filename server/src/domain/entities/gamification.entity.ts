import type { LevelTitle } from '../enums/gamification.enums';


export interface UserGamificationEntity {
  id: string;
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: LevelTitle;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: Date | null; 
  dailyXpEarned: number; 
  dailyChatMessageCount: number;
  todayPomodoroUsed: boolean; //streak requires: 1 todo + pomodoro used
  lastDailyResetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
