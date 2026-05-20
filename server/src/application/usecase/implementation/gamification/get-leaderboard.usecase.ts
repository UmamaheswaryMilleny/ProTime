import { inject, injectable } from 'tsyringe';
import type { IGetLeaderboardUsecase } from '../../interface/gamification/get-leaderboard.usecase.interface.js';
import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface.js';
import type { LeaderboardEntry } from '../../../../domain/entities/gamification.entity.js';

@injectable()
export class GetLeaderboardUsecase implements IGetLeaderboardUsecase {
  constructor(
    @inject('IGamificationRepository')
    private gamificationRepository: IGamificationRepository
  ) {}

  async execute(
    userId: string,
    range: 'today' | 'weekly' | 'monthly' | 'allTime',
    type: 'global' | 'friends',
    limit: number = 50
  ): Promise<{ leaderboard: LeaderboardEntry[]; userRank: number; userEntry: LeaderboardEntry | null }> {
    
    // 1. Fetch Top N
    const leaderboard = await this.gamificationRepository.getLeaderboard(range, type, limit);
    
    // 2. Fetch User Rank
    const userRank = await this.gamificationRepository.getUserRank(userId, range, type);
    
    // 3. Fetch User Entry if not already in Top N
    let userEntry = leaderboard.find((entry) => entry.userId === userId) || null;

    if (!userEntry && userRank > 0) {
      // Create user entry mock using their existing gamification record
      const gamificationDoc = await this.gamificationRepository.findByUserId(userId);
      if (gamificationDoc) {
        userEntry = {
          userId,
          username: 'You', // Since we don't have populate here, fallback to 'You' in frontend
          totalXp: gamificationDoc.totalXp,
          currentLevel: gamificationDoc.currentLevel,
          currentTitle: gamificationDoc.currentTitle,
          currentStreak: gamificationDoc.currentStreak,
        };
      }
    }

    return { leaderboard, userRank, userEntry };
  }
}
