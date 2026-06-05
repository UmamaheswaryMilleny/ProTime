import { inject, injectable } from 'tsyringe';
import type { IGetLeaderboardUsecase } from '../../interface/gamification/get-leaderboard.usecase.interface.js';
import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface.js';
import type { LeaderboardEntry } from '../../../../domain/entities/gamification.entity.js';
import { FREE_MAX_LEVEL, getTitleForLevel, LevelTitle } from '../../../../domain/enums/gamification.enums';

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
    limit: number = 50,
    isPremium?: boolean
  ): Promise<{ leaderboard: LeaderboardEntry[]; userRank: number; userEntry: LeaderboardEntry | null }> {
    
    // Ensure user has a gamification record initialized
    let gamificationDoc = await this.gamificationRepository.findByUserId(userId);
    if (!gamificationDoc) {
      await this.gamificationRepository.save({
        userId,
        totalXp: 0,
        currentLevel: 0,
        currentTitle: LevelTitle.EARLY_BIRD,
        currentStreak: 0,
        longestStreak: 0,
        lastStreakDate: null,
        dailyXpEarned: 0,
        dailyChatMessageCount: 0,
        todayPomodoroUsed: false,
        lastDailyResetDate: null,
      });
    }

    // 1. Fetch Top N
    const leaderboard = await this.gamificationRepository.getLeaderboard(range, type, limit, userId);
    
    // 2. Fetch User Rank
    const userRank = await this.gamificationRepository.getUserRank(userId, range, type);
    
    // 3. Fetch User Entry if not already in Top N
    let userEntry = leaderboard.find((entry) => entry.userId === userId) || null;

    if (!userEntry && userRank > 0) {
      // Create user entry mock using their existing gamification record
      const gamificationDoc = await this.gamificationRepository.findByUserId(userId);
      if (gamificationDoc) {
        const rawLevel = gamificationDoc.currentLevel;
        const currentLevel = !isPremium && rawLevel > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : rawLevel;
        const currentTitle = !isPremium && rawLevel > FREE_MAX_LEVEL ? getTitleForLevel(FREE_MAX_LEVEL) : gamificationDoc.currentTitle;

        userEntry = {
          userId,
          username: 'You', // Since we don't have populate here, fallback to 'You' in frontend
          totalXp: gamificationDoc.totalXp,
          currentLevel,
          currentTitle,
          currentStreak: gamificationDoc.currentStreak,
        };
      }
    }

    return { leaderboard, userRank, userEntry };
  }
}
