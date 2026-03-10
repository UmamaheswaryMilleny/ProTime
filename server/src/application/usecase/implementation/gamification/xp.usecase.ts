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
  BADGE_XP_BONUS,
  FREE_MAX_LEVEL,
} from '../../../../domain/enums/gamification.enums';
import { XpSource } from '../../../../domain/enums/gamification.enums';

@injectable()
export class AwardXpUsecase implements IAwardXpUsecase {
  constructor(
    @inject('IGamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,

    @inject('IUpdateStreakUsecase')
    private readonly updateStreakUsecase: IUpdateStreakUsecase,

    @inject('ICheckAndAwardBadgesUsecase')
    private readonly checkAndAwardBadgesUsecase: ICheckAndAwardBadgesUsecase,
  ) {}

  async execute(params: {
    userId: string;
    xp: number;
    isPremium: boolean;
    source: XpSource;
    todoId?: string;
  }): Promise<AwardXpResponseDTO> {
    const { userId, xp, isPremium, source } = params;

    // 1. Fetch current gamification
    const gamification = await this.gamificationRepository.findByUserId(userId);
    if (!gamification) throw new GamificationNotFoundError();

    const prevLevel = gamification.currentLevel;

    // 2. Award XP — xp=0 means cap was hit (CompleteTodoUsecase sets xpCounted=false)
    //    We still run streak + badge checks even if xp=0
    const newTotalXp = gamification.totalXp + xp;

    // 3. Recalculate level + title — cap at FREE_MAX_LEVEL for free users
    const rawLevel = getLevelFromXp(newTotalXp);
    const newLevel = !isPremium && rawLevel > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : rawLevel;
    const newTitle = getTitleForLevel(newLevel); // ✅ defined before use

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
      const afterStreak = !isPremium && afterStreakRaw > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : afterStreakRaw; // ✅ cap for free
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
      badgeBonusXp = newBadges.filter((b) => b.xpAwarded).length * BADGE_XP_BONUS;

      if (badgeBonusXp > 0) {
        const withBadgeXp = finalTotalXp + badgeBonusXp;

        const levelWithBadgeRaw = getLevelFromXp(withBadgeXp);
        const levelWithBadge = !isPremium && levelWithBadgeRaw > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : levelWithBadgeRaw; // ✅ cap for free
        const titleWithBadge = getTitleForLevel(levelWithBadge);
        finalTotalXp = withBadgeXp;

        await this.gamificationRepository.updateXpAndLevel(userId, {
          totalXp: finalTotalXp,
          currentLevel: levelWithBadge,
          currentTitle: titleWithBadge,
        });
      }
    }

    // 10. Fetch final state for response
    const finalState = await this.gamificationRepository.findByUserId(userId);
    if (!finalState) throw new GamificationNotFoundError();

    return GamificationMapper.toAwardXpResponse({
      xpAwarded: xp + streakBonus + badgeBonusXp,
      prevLevel,
      entity: finalState,
      newBadges,
      streakUpdated,
      streakBonus,
      capReached: xp === 0,
    });
  }
}