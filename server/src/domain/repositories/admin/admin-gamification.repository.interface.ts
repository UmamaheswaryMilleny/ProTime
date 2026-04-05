export interface IAdminGamificationRepository {
  getOverviewStats(): Promise<{
    totalXpEarned: number;
    avgXpPerUser: number;
    totalBadgesAwarded: number;
    activeStreaksCount: number;
    levelDistribution: { level: number; count: number }[];
    topBadges: { badgeId: string; badgeName: string; count: number }[];
    recentBadgeAwards: {
      userId: string;
      fullName: string;
      badgeName: string;
      earnedAt: Date;
    }[];
  }>;

  getUsersProgress(params: {
    search?: string;
    level?: number;
    title?: string;
    sortBy?: 'xp' | 'streak' | 'badges';
    page: number;
    limit: number;
  }): Promise<{
    users: {
        userId: string;
        fullName: string;
        email: string;
        totalXp: number;
        currentLevel: number;
        currentTitle: string;
        currentStreak: number;
        badgeCount: number;
        lastActiveAt: Date | null;
    }[];
    total: number;
  }>;

  getUserDetail(userId: string): Promise<{
    user: any; // User basic info
    gamification: any;
    badges: any[];
  } | null>;

  getLeaderboard(params: {
    period?: 'all-time' | 'this-month' | 'this-week';
    plan?: 'all' | 'free' | 'premium';
    page: number;
    limit?: number;
  }): Promise<{
    rankings: {
      userId: string;
      fullName: string;
      currentLevel: number;
      currentTitle: string;
      totalXp: number;
      currentStreak: number;
      isPremium: boolean;
    }[];
    total: number;
  }>;

  getBadgesGrid(): Promise<{
    badges: any[];
    recentAwards: any[];
  }>;

  toggleBadgeActivation(badgeId: string): Promise<void>;
}
