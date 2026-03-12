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
  // streakFrozen: boolean; 


  dailyXpEarned: number;
  dailyChatMessageCount: number;
  dailyAiTokenCount: number; // NEW
  monthlyBuddyMatchCount: number; // NEW
  monthlyRoomJoinCount: number; // NEW
  todayPomodoroUsed: boolean;
  lastDailyResetDate: Date | null;// Daily counters (dailyXpEarned, dailyChatMessageCount, todayPomodoroUsed) need to reset to zero every new day. 
  // null = never reset (brand new user)

  createdAt: Date;
  updatedAt: Date;
}
