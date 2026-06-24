import { inject, injectable } from 'tsyringe';
import type { ICheckAndAwardBadgesUsecase } from '../../interface/gamification/check-and-award-badges.usecase.interface';
import type { IAwardXpUsecase } from '../../interface/gamification/award-xp.usecase.interface';
import type { IUpdateStreakUsecase } from '../../interface/gamification/update.streak.usecase.interface';
import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { AwardXpResponseDTO } from '../../../dto/gamification/response/award-xp.response.dto';
import { GamificationMapper } from '../../../mapper/gamification.mapper';
import { GamificationNotFoundError } from '../../../../domain/errors/gamification.error';
import {
  getLevelFromXp,
  getTitleForLevel,
  BADGE_XP_BONUS_PREMIUM,
  BADGE_XP_BONUS_FREE,
  FREE_MAX_LEVEL,
} from '../../../../domain/enums/gamification.enums';
import { XpSource } from '../../../../domain/enums/gamification.enums';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';

@injectable()
export class AwardXpUsecase implements IAwardXpUsecase {
  constructor(
    @inject('IGamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,

    @inject('IUpdateStreakUsecase')
    private readonly updateStreakUsecase: IUpdateStreakUsecase,

    @inject('ICheckAndAwardBadgesUsecase')
    private readonly checkAndAwardBadgesUsecase: ICheckAndAwardBadgesUsecase,

    @inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) { }

  async execute(params: {
    userId: string;
    xp: number;
    isPremium: boolean;
    source: XpSource;
    todoId?: string;
    suppressNotification?: boolean;
  }): Promise<AwardXpResponseDTO> {
    const { userId, xp, isPremium, source } = params;

    // 1. Fetch current gamification
    const gamification = await this.gamificationRepository.findByUserId(userId);
    if (!gamification) throw new GamificationNotFoundError();

    const prevLevel = gamification.currentLevel;

    // 2. Award XP — xp=0 means cap was hit (CompleteTodoUsecase sets xpCounted=false)
    //    We still run streak + badge checks even if xp=0
    const newTotalXp = gamification.totalXp + xp;

    // 3. Recalculate level + title — store uncapped in database
    const rawLevel = getLevelFromXp(newTotalXp);
    const newLevel = rawLevel;
    const newTitle = getTitleForLevel(rawLevel);

    // 4. Persist XP + level update
    await this.gamificationRepository.updateXpAndLevel(userId, {
      totalXp: newTotalXp,
      currentLevel: newLevel,
      currentTitle: newTitle,
    });

    // 5. Increment daily XP counter — atomic $inc, only if XP was actually awarded
    if (xp > 0) {
      await this.gamificationRepository.incrementDailyXpEarned(userId, xp); // ✅ use atomic increment
    }

    // 6. Update streak — runs on every todo completion
    const { streakUpdated, streakBonus } =
      await this.updateStreakUsecase.execute(userId, isPremium);

    // 7. If streak hit a milestone — award streak bonus XP
    let finalTotalXp = newTotalXp;
    if (streakBonus > 0) {
      finalTotalXp = newTotalXp + streakBonus;

      const afterStreakRaw = getLevelFromXp(finalTotalXp);
      const afterStreak = afterStreakRaw;
      const afterTitle = getTitleForLevel(afterStreak);

      await this.gamificationRepository.updateXpAndLevel(userId, {
        totalXp: finalTotalXp,
        currentLevel: afterStreak,
        currentTitle: afterTitle,
      });
    }

    // 8. Check + award badges
    const newBadges = await this.checkAndAwardBadgesUsecase.execute({
      userId,
      isPremium,
      source,
    });

    // 9. Award badge XP bonuses if any badges earned
    let badgeBonusXp = 0;
    if (newBadges.length > 0) {
      const awardedCount = newBadges.filter((b) => b.xpAwarded).length;
      badgeBonusXp = awardedCount * (isPremium ? BADGE_XP_BONUS_PREMIUM : BADGE_XP_BONUS_FREE);

      if (badgeBonusXp > 0) {
        const withBadgeXp = finalTotalXp + badgeBonusXp;

        const levelWithBadgeRaw = getLevelFromXp(withBadgeXp);
        const levelWithBadge = levelWithBadgeRaw;
        const titleWithBadge = getTitleForLevel(levelWithBadge);
        finalTotalXp = withBadgeXp;

        await this.gamificationRepository.updateXpAndLevel(userId, {
          totalXp: finalTotalXp,
          currentLevel: levelWithBadge,
          currentTitle: titleWithBadge,
        });
      }
    }

    const finalState = await this.gamificationRepository.findByUserId(userId);
    if (!finalState) throw new GamificationNotFoundError();

    // Notify user of progress
    const xpAwardedTotal = xp + streakBonus + badgeBonusXp;
    if (xpAwardedTotal > 0 && !params.suppressNotification) {
      this.notificationService.notifyUser(userId, {
        type: NotificationType.XP_GAINED,
        title: 'XP Gained!',
        message: `You've earned ${xpAwardedTotal} XP! Keep up the great work.`,
      });
    }

    const prevCapped = !isPremium && prevLevel > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : prevLevel;
    const currentCapped = !isPremium && finalState.currentLevel > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : finalState.currentLevel;

    if (currentCapped > prevCapped) {
      const cappedTitle = getTitleForLevel(currentCapped);
      this.notificationService.notifyUser(userId, {
        type: NotificationType.LEVEL_UP,
        title: 'Level Up!',
        message: `Congratulations! You've reached Level ${currentCapped} and earned the title "${cappedTitle}".`,
      });
    }

    return GamificationMapper.toAwardXpResponse({
      xpAwarded: xp + streakBonus + badgeBonusXp,
      prevLevel,
      entity: finalState,
      newBadges,
      streakUpdated,
      streakBonus,
      capReached: xp === 0,
      isPremium,
    });
  }
}