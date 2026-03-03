import { inject, injectable } from 'tsyringe';
import type { IUpdateStreakUsecase } from '../../interface/user/gamification.usecase.interface'
import type { IGamificationRepository }  from '../../../../domain/repositories/gamification.repository.interface';
import { GamificationNotFoundError } from '../../../../domain/errors/gamification.error';
import { STREAK_BONUS_XP } from '../../../../domain/enums/gamification.enums';

@injectable()
export class UpdateStreakUsecase implements IUpdateStreakUsecase {
    constructor(
        @inject('IGamificationRepository')
        private readonly gamificationRepository: IGamificationRepository,
    ) { }

    async execute(userId: string): Promise<{
        streakUpdated: boolean;
        streakBonus: number;
        currentStreak: number;
    }> {
        const gamification = await this.gamificationRepository.findByUserId(userId);
        if (!gamification) throw new GamificationNotFoundError();

        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const lastStreak = gamification.lastStreakDate
            ? new Date(
                gamification.lastStreakDate.getFullYear(),
                gamification.lastStreakDate.getMonth(),
                gamification.lastStreakDate.getDate(),
            )
            : null;

        // Already updated streak today — don't double count
        if (lastStreak && lastStreak.getTime() === todayDate.getTime()) {
            return {
                streakUpdated: false,
                streakBonus: 0,
                currentStreak: gamification.currentStreak,
            };
        }

        if (!gamification.todayPomodoroUsed) {
            return {
                streakUpdated: false,
                streakBonus: 0,
                currentStreak: gamification.currentStreak,
            };
        }

        // Calculate yesterday's date for consecutive check
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak: number;

        if (!lastStreak) {
            // First ever streak activity
            newStreak = 1;
        } else if (lastStreak.getTime() === yesterday.getTime()) {
            // Consecutive day — increment streak
            newStreak = gamification.currentStreak + 1;
        } else {
            // Gap of more than 1 day — reset streak
            newStreak = 1;
        }

        const newLongest = Math.max(newStreak, gamification.longestStreak);

        // Update streak in DB
        await this.gamificationRepository.updateStreak(userId, {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastStreakDate: todayDate,
        });

        // Check if this streak hits a milestone for bonus XP
        const streakBonus = STREAK_BONUS_XP[newStreak] ?? 0;

        return {
            streakUpdated: true,
            streakBonus,
            currentStreak: newStreak,
        };
    }
}