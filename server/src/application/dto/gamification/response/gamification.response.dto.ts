import type { LevelTitle } from '../../../../domain/enums/gamification.enums.js';
import { UserBadgeResponseDTO } from './user-badge.response.dto.js';

// Frontend uses this to render XP bar, level badge, streak counter, title.
export interface GamificationResponseDTO {
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: LevelTitle;

  // isTitleLocked = true when user is FREE and title is above Learner
  isTitleLocked: boolean;

  // XP needed to reach next level — for progress bar rendering
  xpForCurrentLevel: number; 
  xpForNextLevel: number; 
  xpProgress: number; // XP earned within current level (totalXp - xpForCurrentLevel)

  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null; //used to determine if their streak is still alive.

  // Frontend uses these to show daily limit warnings
  dailyXpEarned: number; // XP earned today (cap: 50)
  dailyChatMessageCount: number; // out of 10 (free users)


  earnedBadges: UserBadgeResponseDTO[];
  totalBadgeCount: number;

  createdAt: string;
  updatedAt: string;
}




