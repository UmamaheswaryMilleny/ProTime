import { inject, injectable } from 'tsyringe';
import type {
    IAwardXpUsecase,
    XpSource,
    IUpdateStreakUsecase,
    ICheckAndAwardBadgesUsecase,
} from '../../interface/user/gamification.usecase.interface';
import type { IGamificationRepository }  from '../../../../domain/repositories/gamification.repository.interface';
import type {
    AwardXpResponseDTO,
} from '../../../dto/user/response/gamification.response.dto';
import { GamificationMapper } from '../../../mapper/gamification.mapper';
import { GamificationNotFoundError } from '../../../../domain/errors/gamification.error';
import {
    getLevelFromXp,
    getTitleForLevel,
    BADGE_XP_BONUS,
} from '../../../../domain/enums/gamification.enums';

// ─── AwardXpUsecase ───────────────────────────────────────────────────────────
// Central orchestrator for all XP-related events.
// Called by CompleteTodoUsecase after todo is marked complete.
//
// Flow:
//   1. Fetch gamification + check daily reset
//   2. Award XP (check daily cap — todos already enforce this via xpCounted)
//   3. Recalculate level + title
//   4. Update streak
//   5. Check + award badges
//   6. Award badge bonus XP if any badges earned
//   7. Persist final state
//   8. Return AwardXpResponseDTO for frontend animation

@injectable()
export class AwardXpUsecase implements IAwardXpUsecase {
    constructor(
        @inject('IGamificationRepository')
        private readonly gamificationRepository: IGamificationRepository,

        @inject('IUpdateStreakUsecase')
        private readonly updateStreakUsecase: IUpdateStreakUsecase,

        @inject('ICheckAndAwardBadgesUsecase')
        private readonly checkAndAwardBadgesUsecase: ICheckAndAwardBadgesUsecase,
    ) { }

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

        // 3. Recalculate level + title from new total XP
        const newLevel = getLevelFromXp(newTotalXp);
        const newTitle = getTitleForLevel(newLevel);

        // 4. Persist XP + level update
        await this.gamificationRepository.updateXpAndLevel(userId, {
            totalXp: newTotalXp,
            currentLevel: newLevel,
            currentTitle: newTitle,
        });

        // 5. Update streak — runs on every todo completion
        const { streakUpdated, streakBonus } =
            await this.updateStreakUsecase.execute(userId);

        // 6. If streak hit a milestone — award streak bonus XP recursively
        let finalTotalXp = newTotalXp;
        if (streakBonus > 0) {
            const afterStreak = getLevelFromXp(newTotalXp + streakBonus);
            const afterTitle = getTitleForLevel(afterStreak);
            finalTotalXp = newTotalXp + streakBonus;

            await this.gamificationRepository.updateXpAndLevel(userId, {
                totalXp: finalTotalXp,
                currentLevel: afterStreak,
                currentTitle: afterTitle,
            });
        }

        // 7. Check + award badges
        const newBadges = await this.checkAndAwardBadgesUsecase.execute({
            userId,
            isPremium,
            source,
        });

        // 8. Award badge XP bonuses if any badges earned
        let badgeBonusXp = 0;
        if (newBadges.length > 0) {
            badgeBonusXp = newBadges
                .filter((b) => b.xpAwarded)
                .length * BADGE_XP_BONUS; // 50 XP per badge

            if (badgeBonusXp > 0) {
                const withBadgeXp = finalTotalXp + badgeBonusXp;
                const levelWithBadge = getLevelFromXp(withBadgeXp);
                const titleWithBadge = getTitleForLevel(levelWithBadge);
                finalTotalXp = withBadgeXp;

                await this.gamificationRepository.updateXpAndLevel(userId, {
                    totalXp: finalTotalXp,
                    currentLevel: levelWithBadge,
                    currentTitle: titleWithBadge,
                });
            }
        }

        // 9. Fetch final state for response
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