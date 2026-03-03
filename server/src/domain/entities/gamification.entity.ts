import type { LevelTitle } from '../enums/gamification.enums';

//   GamificationEntity → progress, XP,level, streak, daily counters
export interface UserGamificationEntity {
  id: string;
  userId: string;

  totalXp: number;
  currentLevel: number;
  currentTitle: LevelTitle;
  // Free users: title above Learner shown locked in UI
  // but stored correctly here — frontend handles lock display

  currentStreak: number;
  longestStreak: number;
  lastStreakDate: Date | null; // null = user has never had a streak
  streakFrozen: boolean; // future: streak freeze powerup (premium feature)


  dailyXpEarned: number; // XP earned today (cap: 50)
  dailyChatMessageCount: number; // community chat messages sent today (free cap: 10)
  todayPomodoroUsed: boolean; // true if any pomodoro was completed today streak requires: 1 todo + pomodoro used
  lastDailyResetDate: Date | null;// Daily counters (dailyXpEarned, dailyChatMessageCount, todayPomodoroUsed) need to reset to zero every new day. 
  // null = never reset (brand new user)

  createdAt: Date;
  updatedAt: Date;
}
