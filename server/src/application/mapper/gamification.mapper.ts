import type { UserGamificationEntity } from '../../domain/entities/gamification.entity';
import type {
  UserBadgeEntity,
  BadgeDefinitionEntity,
} from '../../domain/entities/badge.entity';
import type {
  GamificationResponseDTO,
  AwardXpResponseDTO,
  UserBadgeResponseDTO,
  InitializeGamificationResponseDTO,
} from '../dto/user/response/gamification.response.dto';
import {
  LevelTitle,
  LEVEL_XP_THRESHOLDS,
  MAX_LEVEL,
} from '../../domain/enums/gamification.enums';

export class GamificationMapper {
  static toBadgeResponse(
    userBadge: UserBadgeEntity,
    definition: BadgeDefinitionEntity,
  ): UserBadgeResponseDTO {
    return {
      id: userBadge.id,
      badgeKey: userBadge.badgeKey,
      name: definition.name,
      description: definition.description,
      iconUrl: definition.iconUrl,
      category: definition.category,
      xpAwarded: userBadge.xpAwarded,
      earnedAt: userBadge.earnedAt.toISOString(),
    };
  }


  //used in the dashboard to show gamification
  static toResponse(
    entity: UserGamificationEntity,
    earnedBadges: UserBadgeResponseDTO[],
    isPremium: boolean,
  ): GamificationResponseDTO {
    const currentLevelXp = LEVEL_XP_THRESHOLDS[entity.currentLevel] ?? 0;
    const nextLevel = Math.min(entity.currentLevel + 1, MAX_LEVEL);
    const nextLevelXp =
      LEVEL_XP_THRESHOLDS[nextLevel] ?? LEVEL_XP_THRESHOLDS[MAX_LEVEL];
    const xpProgress = entity.totalXp - currentLevelXp;

    // Title is locked if user is FREE and title is above Learner
    const freeTitleOrder = [
      LevelTitle.EARLY_BIRD,
      LevelTitle.BEGINNER,
      LevelTitle.LEARNER,
    ];
    const isTitleLocked =
      !isPremium && !freeTitleOrder.includes(entity.currentTitle);

    return {
      userId: entity.userId,
      totalXp: entity.totalXp,
      currentLevel: entity.currentLevel,
      currentTitle: entity.currentTitle,
      isTitleLocked,

      xpForCurrentLevel: currentLevelXp,
      xpForNextLevel: nextLevelXp!,
      xpProgress,

      currentStreak: entity.currentStreak,
      longestStreak: entity.longestStreak,
      lastStreakDate: entity.lastStreakDate
        ? entity.lastStreakDate.toISOString()
        : null,

      dailyXpEarned: entity.dailyXpEarned,
      dailyChatMessageCount: entity.dailyChatMessageCount,

      earnedBadges,
      totalBadgeCount: earnedBadges.length,

      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  //xp awarded when completing certain tasks then it popup 
  static toAwardXpResponse(params: {
    xpAwarded: number;
    prevLevel: number;
    entity: UserGamificationEntity;
    newBadges: UserBadgeResponseDTO[];
    streakUpdated: boolean;
    streakBonus: number;
    capReached: boolean;
  }): AwardXpResponseDTO {
    return {
      xpAwarded: params.xpAwarded,
      totalXp: params.entity.totalXp,
      currentLevel: params.entity.currentLevel,
      currentTitle: params.entity.currentTitle,
      leveledUp: params.entity.currentLevel > params.prevLevel,
      newBadges: params.newBadges,
      streakUpdated: params.streakUpdated,
      streakBonus: params.streakBonus,
      capReached: params.capReached,
    };
  }

  // only once, when user first registers:
  static toInitResponse(
    entity: UserGamificationEntity,
  ): InitializeGamificationResponseDTO {
    return {
      userId: entity.userId,
      totalXp: entity.totalXp,
      currentLevel: entity.currentLevel,
      currentTitle: entity.currentTitle,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
