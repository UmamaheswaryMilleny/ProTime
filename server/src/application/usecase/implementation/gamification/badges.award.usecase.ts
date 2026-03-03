import { inject, injectable } from 'tsyringe';
import type {
    ICheckAndAwardBadgesUsecase,
    XpSource,
} from '../../interface/user/gamification.usecase.interface';
import type {
    IGamificationRepository,
    IBadgeDefinitionRepository,
    IUserBadgeRepository,
}from '../../../../domain/repositories/gamification.repository.interface';

import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { UserBadgeResponseDTO } from '../../../dto/user/response/gamification.response.dto';
import { GamificationMapper } from '../../../mapper/gamification.mapper';
import { GamificationNotFoundError } from '../../../../domain/errors/gamification.error';
import { BadgeConditionType } from '../../../../domain/enums/gamification.enums';

import { TodoPriority } from '../../../../domain/enums/todo.enums';

@injectable()
export class CheckAndAwardBadgesUsecase implements ICheckAndAwardBadgesUsecase {
    constructor(
        @inject('IGamificationRepository')
        private readonly gamificationRepository: IGamificationRepository,

        @inject('IBadgeDefinitionRepository')
        private readonly badgeDefinitionRepository: IBadgeDefinitionRepository,

        @inject('IUserBadgeRepository')
        private readonly userBadgeRepository: IUserBadgeRepository,

        @inject('ITodoRepository')
        private readonly todoRepository: ITodoRepository,
    ) { }

    async execute(params: {
        userId: string;
        isPremium: boolean;
        source: XpSource;
    }): Promise<UserBadgeResponseDTO[]> {
        const { userId, isPremium, source } = params;

        // 1. Get current gamification state
        const gamification = await this.gamificationRepository.findByUserId(userId);
        if (!gamification) throw new GamificationNotFoundError();

        // 2. Get already earned badge keys — to skip already earned
        const earnedBadges = await this.userBadgeRepository.findAllByUserId(userId);
        const earnedKeys = new Set(earnedBadges.map((b) => b.badgeKey));

        // 3. Get active badge definitions — only relevant category for this source
        const relevantConditions = this.getRelevantConditions(source);
        const allActive = await this.badgeDefinitionRepository.findAllActive();
        const candidates = allActive.filter(
            (b) => relevantConditions.includes(b.conditionType as BadgeConditionType)
                && !earnedKeys.has(b.key),
        );

        if (candidates.length === 0) return [];

        // 4. Fetch counts needed for condition checks (only what's needed)
        const needsTaskCounts = candidates.some((b) =>
            [BadgeConditionType.HIGH_TASK_COUNT, BadgeConditionType.MEDIUM_TASK_COUNT, BadgeConditionType.LOW_TASK_COUNT]
                .includes(b.conditionType as BadgeConditionType));

        const [highCount, mediumCount, lowCount] = needsTaskCounts
            ? await Promise.all([
                this.todoRepository.countCompletedByPriority(userId, TodoPriority.HIGH),
                this.todoRepository.countCompletedByPriority(userId, TodoPriority.MEDIUM),
                this.todoRepository.countCompletedByPriority(userId, TodoPriority.LOW),
            ])
            : [0, 0, 0];

        // 5. Check each candidate — award if condition met
        const newlyEarned: UserBadgeResponseDTO[] = [];

        for (const badge of candidates) {
            // Premium-only badge — skip if user is FREE
            if (badge.premiumRequired && !isPremium) continue;

            const conditionMet = this.checkCondition(
                badge.conditionType as BadgeConditionType,
                badge.conditionValue,
                { highCount, mediumCount, lowCount, streak: gamification.currentStreak },
            );

            if (!conditionMet) continue;

            // Award badge — xpAwarded only if premium or badge is free
            const xpAwarded = isPremium || !badge.premiumRequired;

            const userBadge = await this.userBadgeRepository.save({
                userId,
                badgeDefinitionId: badge.id,
                badgeKey: badge.key,
                earnedAt: new Date(),
                xpAwarded,
            });

            // If XP should be awarded — add badge bonus XP to gamification
            // Note: actual XP crediting happens in AwardXpUsecase after this returns
            if (xpAwarded) {
                // AwardXpUsecase will call AwardXp again with source BADGE_BONUS for each badge
                // We just return the badges here — caller handles XP
            }

            newlyEarned.push(GamificationMapper.toBadgeResponse(userBadge, badge));
        }

        return newlyEarned;
    }

    // ─── Map XpSource to relevant BadgeConditionTypes ─────────────────────────
    private getRelevantConditions(source: XpSource): BadgeConditionType[] {
        switch (source) {
            case 'TODO_HIGH': return [BadgeConditionType.HIGH_TASK_COUNT];
            case 'TODO_MEDIUM': return [BadgeConditionType.MEDIUM_TASK_COUNT];
            case 'TODO_LOW': return [BadgeConditionType.LOW_TASK_COUNT];
            case 'STREAK_BONUS': return [BadgeConditionType.STREAK_DAYS];
            default: return [];
        }
    }

    // ─── Check if condition value is met ──────────────────────────────────────
    private checkCondition(
        type: BadgeConditionType,
        value: number,
        stats: { highCount: number; mediumCount: number; lowCount: number; streak: number },
    ): boolean {
        switch (type) {
            case BadgeConditionType.HIGH_TASK_COUNT: return stats.highCount >= value;
            case BadgeConditionType.MEDIUM_TASK_COUNT: return stats.mediumCount >= value;
            case BadgeConditionType.LOW_TASK_COUNT: return stats.lowCount >= value;
            case BadgeConditionType.STREAK_DAYS: return stats.streak >= value;
            default: return false;
        }
    }
}