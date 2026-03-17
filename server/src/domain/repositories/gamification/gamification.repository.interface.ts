import type { IBaseRepository } from '../base/base.repository.interface.js';
import type { UserGamificationEntity } from '../../entities/gamification.entity.js';
import type { BadgeDefinitionEntity } from '../../entities/badge.entity.js';
import type { UserBadgeEntity } from '../../entities/badge.entity.js';
import type { BadgeCategory, LevelTitle } from '../../enums/gamification.enums.js';

export interface IGamificationRepository extends IBaseRepository<UserGamificationEntity> {
  findByUserId(userId: string): Promise<UserGamificationEntity | null>;

  // XP + level + title update — called after every XP award
  updateXpAndLevel(
    userId: string,
    data: {
      totalXp: number;
      currentLevel: number;
      currentTitle: LevelTitle;
    },
  ): Promise<UserGamificationEntity | null>;

  // Streak update — called after daily activity check
  updateStreak(
    userId: string,
    data: {
      currentStreak: number;
      longestStreak: number;
      lastStreakDate: Date | null;
    },
  ): Promise<UserGamificationEntity | null>;

  // Every new day all daily counters need to reset to zero in one  DB call.
  resetDailyCounters(userId: string): Promise<UserGamificationEntity | null>;


  incrementDailyXpEarned(userId: string, xp: number): Promise<void>;


  incrementDailyChatCount(userId: string): Promise<void>;

  // Used by UpdateStreakUsecase to verify streak eligibility (needs pomodoro)
  markPomodoroUsedToday(userId: string): Promise<void>;
}


// admin-editable badge
export interface IBadgeDefinitionRepository extends IBaseRepository<BadgeDefinitionEntity> {
  // Find badge template by its unique key e.g. 'HIGH_ACHIEVER'
  findByKey(key: string): Promise<BadgeDefinitionEntity | null>;

  // Get all active badge definitions — used to render badge gallery in UI
  findAllActive(): Promise<BadgeDefinitionEntity[]>;

  // Get active badges by category — used for category-filtered badge views
  findByCategory(category: BadgeCategory): Promise<BadgeDefinitionEntity[]>;
}


export interface IUserBadgeRepository extends IBaseRepository<UserBadgeEntity> {
  // Get all badges earned by a user — for profile and badge gallery
  findAllByUserId(userId: string): Promise<UserBadgeEntity[]>;

  // Check if user already has a specific badge — prevents duplicate awards
  findByUserIdAndBadgeKey(
    userId: string,
    badgeKey: string,
  ): Promise<UserBadgeEntity | null>;

  // Count earned badges by user — used for progress report
  countByUserId(userId: string): Promise<number>;
}
