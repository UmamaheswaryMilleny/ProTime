import { inject, injectable } from 'tsyringe';
import type { IInitializeGamificationUsecase } from '../../interface/user/gamification.usecase.interface';
import type { IGamificationRepository }  from '../../../../domain/repositories/gamification.repository.interface';
import type { InitializeGamificationResponseDTO } from '../../../dto/user/response/gamification.response.dto';
import { GamificationMapper } from '../../../mapper/gamification.mapper';
import { LevelTitle } from '../../../../domain/enums/gamification.enums';

@injectable()
export class InitializeGamificationUsecase implements IInitializeGamificationUsecase {
    constructor(
        @inject('IGamificationRepository')
        private readonly gamificationRepository: IGamificationRepository,
    ) { }

    async execute(userId: string): Promise<InitializeGamificationResponseDTO> {
        // Create gamification profile with all zeros
        // Called once on signup — never called again for the same user
        const gamification = await this.gamificationRepository.save({
            userId,
            totalXp: 0,
            currentLevel: 0,
            currentTitle: LevelTitle.EARLY_BIRD,

            currentStreak: 0,
            longestStreak: 0,
            lastStreakDate: null,
            streakFrozen: false,

      dailyXpEarned: 0,
            dailyChatMessageCount: 0,
            todayPomodoroUsed: false,  // ✅ added
            lastDailyResetDate: null,
        });

        return GamificationMapper.toInitResponse(gamification);
    }
}