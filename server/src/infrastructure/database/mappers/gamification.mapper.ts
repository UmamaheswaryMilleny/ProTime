import type { UserGamificationDocument } from '../models/user-gamification.model';
import type { BadgeDefinitionDocument, UserBadgeDocument } from '../models/badge.model';
import type { UserGamificationEntity } from '../../../domain/entities/gamification.entity';
import type { BadgeDefinitionEntity,UserBadgeEntity } from '../../../domain/entities/badge.entity';
import { LevelTitle } from '../../../domain/enums/gamification.enums'

// ─── UserGamification Mapper ──────────────────────────────────────────────────
export class UserGamificationMapper {

  static toDomain(doc: UserGamificationDocument): UserGamificationEntity {
    return {
      id:     (doc._id as { toString(): string }).toString(),
      userId: doc.userId.toString(),

      totalXp:      doc.totalXp,
      currentLevel: doc.currentLevel,
      currentTitle: doc.currentTitle as LevelTitle,

      currentStreak:  doc.currentStreak,
      longestStreak:  doc.longestStreak,
      lastStreakDate: doc.lastStreakDate ?? null,
      // streakFrozen:   doc.streakFrozen,

      dailyXpEarned:         doc.dailyXpEarned,
      dailyChatMessageCount: doc.dailyChatMessageCount,
      todayPomodoroUsed:     doc.todayPomodoroUsed,
      lastDailyResetDate:    doc.lastDailyResetDate ?? null,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPersistence(
    data: Partial<UserGamificationEntity>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId        !== undefined) result.userId        = data.userId;
    if (data.totalXp       !== undefined) result.totalXp       = data.totalXp;
    if (data.currentLevel  !== undefined) result.currentLevel  = data.currentLevel;
    if (data.currentTitle  !== undefined) result.currentTitle  = data.currentTitle;

    if (data.currentStreak  !== undefined) result.currentStreak  = data.currentStreak;
    if (data.longestStreak  !== undefined) result.longestStreak  = data.longestStreak;
    if (data.lastStreakDate !== undefined) result.lastStreakDate = data.lastStreakDate ?? null;
    // if (data.streakFrozen   !== undefined) result.streakFrozen   = data.streakFrozen;

    if (data.dailyXpEarned         !== undefined) result.dailyXpEarned         = data.dailyXpEarned;
    if (data.dailyChatMessageCount !== undefined) result.dailyChatMessageCount = data.dailyChatMessageCount;
    if (data.todayPomodoroUsed     !== undefined) result.todayPomodoroUsed     = data.todayPomodoroUsed;
    if (data.lastDailyResetDate    !== undefined) result.lastDailyResetDate    = data.lastDailyResetDate ?? null;

    return result;
  }
}

// ─── BadgeDefinition Mapper ───────────────────────────────────────────────────
export class BadgeDefinitionMapper {

  static toDomain(doc: BadgeDefinitionDocument): BadgeDefinitionEntity {
    return {
      id:              (doc._id as { toString(): string }).toString(),
      key:             doc.key,
      name:            doc.name,
      description:     doc.description,
      iconUrl:         doc.iconUrl ?? undefined,
      category:        doc.category,
      conditionType:   doc.conditionType,
      conditionValue:  doc.conditionValue,
      xpReward:        doc.xpReward,
      premiumRequired: doc.premiumRequired,
      isActive:        doc.isActive,
      createdAt:       doc.createdAt,
      updatedAt:       doc.updatedAt,
    };
  }
}

// ─── UserBadge Mapper ─────────────────────────────────────────────────────────
export class UserBadgeMapper {

  static toDomain(doc: UserBadgeDocument): UserBadgeEntity {
    return {
      id:                (doc._id as { toString(): string }).toString(),
      userId:            doc.userId.toString(),
      badgeDefinitionId: doc.badgeDefinitionId.toString(),
      badgeKey:          doc.badgeKey,
      earnedAt:          doc.earnedAt,
      xpAwarded:         doc.xpAwarded,
      // createdAt:         doc.createdAt,
      // updatedAt:         doc.updatedAt,
    };
  }

  static toPersistence(
    data: Partial<UserBadgeEntity>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId            !== undefined) result.userId            = data.userId;
    if (data.badgeDefinitionId !== undefined) result.badgeDefinitionId = data.badgeDefinitionId;
    if (data.badgeKey          !== undefined) result.badgeKey          = data.badgeKey;
    if (data.earnedAt          !== undefined) result.earnedAt          = data.earnedAt;
    if (data.xpAwarded         !== undefined) result.xpAwarded         = data.xpAwarded;

    return result;
  }
}