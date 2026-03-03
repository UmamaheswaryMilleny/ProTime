import type { LevelTitle } from '../../../../domain/enums/gamification.enums.js';
import type { BadgeCategory } from '../../../../domain/enums/gamification.enums.js';

// ─── Badge Definition Response ────────────────────────────────────────────────
// Used in badge gallery — shows all available badges with lock state
export interface BadgeDefinitionResponseDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: BadgeCategory;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  premiumRequired: boolean;
}

// ─── Earned Badge Response ────────────────────────────────────────────────────
// Used on profile and badge gallery to show earned badges
export interface UserBadgeResponseDTO {
  id: string;
  badgeKey: string;
  name: string; // denormalized from BadgeDefinition for convenience
  description: string; // denormalized
  iconUrl?: string; // denormalized
  category: BadgeCategory; // denormalized
  xpAwarded: boolean; // false if earned while FREE (no XP bonus given)
  earnedAt: string; // ISO string
}

// ─── Gamification Response ────────────────────────────────────────────────────
// Main response returned by GetGamification usecase.
// Frontend uses this to render XP bar, level badge, streak counter, title.
export interface GamificationResponseDTO {
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: LevelTitle;

  // ─── Title lock info ─────────────────────────────────────────────────────
  // isTitleLocked = true when user is FREE and title is above Learner
  // Frontend shows: "🔒 Explorer — Upgrade to unlock"
  isTitleLocked: boolean;

  // ─── Level progress ──────────────────────────────────────────────────────
  // XP needed to reach next level — for progress bar rendering
  xpForCurrentLevel: number; // XP threshold of current level
  xpForNextLevel: number; // XP threshold of next level (null if max level)
  xpProgress: number; // XP earned within current level (totalXp - xpForCurrentLevel)

  // ─── Streak ──────────────────────────────────────────────────────────────
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null; // ISO string

  // ─── Daily counters ──────────────────────────────────────────────────────
  // Frontend uses these to show daily limit warnings
dailyXpEarned: number;       // XP earned today (cap: 50)
  dailyChatMessageCount: number; // out of 10 (free users)

  // ─── Earned badges ───────────────────────────────────────────────────────
  earnedBadges: UserBadgeResponseDTO[];
  totalBadgeCount: number;

  createdAt: string;
  updatedAt: string;
}

// ─── Award XP Response ───────────────────────────────────────────────────────
// Returned after every XP award — frontend uses to show XP popup animation
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

// ─── Initialize Gamification Response ────────────────────────────────────────
// Returned when gamification profile is first created on signup
export interface InitializeGamificationResponseDTO {
  userId: string;
  totalXp: number; // always 0
  currentLevel: number; // always 0
  currentTitle: LevelTitle; // always EARLY_BIRD
  createdAt: string;
}
