import type { LevelTitle } from '../../../../domain/enums/gamification.enums.js';
import type { BadgeCategory } from '../../../../domain/enums/gamification.enums.js';

// shows all available badges
export interface BadgeDefinitionResponseDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: BadgeCategory;
  conditionType: string; //eg complete 10podoro or focus time this minutes
  conditionValue: number; //like 10 pomodoro or 120 focus minutes
  xpReward: number;
  premiumRequired: boolean;
}

// Used on profile and badge gallery to show earned badges
export interface UserBadgeResponseDTO {
  id: string;
  badgeKey: string; //eg 'learner','warrior'
  name: string; // denormalized from BadgeDefinition for convenience
  description: string; // denormalized
  iconUrl?: string; // denormalized
  category: BadgeCategory; // denormalized
  xpAwarded: boolean; // false if earned while FREE (no XP bonus given)
  earnedAt: string;
}

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


//returned instantly after an action (completing a Pomodoro, sending a chat, etc.) to drive real-time UI feedback.
export interface AwardXpResponseDTO {
  xpAwarded: number; // actual XP credited (0 if daily cap hit)
  totalXp: number; // new total XP
  currentLevel: number; // new level (may have increased)
  currentTitle: LevelTitle; // new title (may have changed)
  leveledUp: boolean; // true if level increased this award
  newBadges: UserBadgeResponseDTO[]; // any badges earned from this action
  streakUpdated: boolean; // true if streak was incremented
  streakBonus: number; // XP from streak milestone (0 if no milestone hit)
  capReached: boolean; // true if daily XP cap was hit
}


// Returned when profile is first created on signup
export interface InitializeGamificationResponseDTO {
  userId: string;
  totalXp: number; // always 0
  currentLevel: number; // always 0
  currentTitle: LevelTitle; // always EARLY_BIRD
  createdAt: string;
}
