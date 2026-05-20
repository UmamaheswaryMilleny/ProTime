import type { LeaderboardEntry } from '../../../../domain/entities/gamification.entity.js';

export interface IGetLeaderboardUsecase {
  execute(
    userId: string,
    range: 'today' | 'weekly' | 'monthly' | 'allTime',
    type: 'global' | 'friends',
    limit?: number
  ): Promise<{ leaderboard: LeaderboardEntry[]; userRank: number; userEntry: LeaderboardEntry | null }>;
}
