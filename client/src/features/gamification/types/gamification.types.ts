export interface UserBadge {
    id: string;
    badgeKey: string;
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    earnedAt: string;
}

export interface GamificationData {
    userId: string;
    totalXp: number;
    currentLevel: number;
    currentTitle: string;
    isTitleLocked: boolean;
    rawLevel: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    xpProgress: number;
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;
    dailyXpEarned: number;
    dailyChatMessageCount: number;
    earnedBadges: UserBadge[];
    totalBadgeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AwardXpResponse {
    xpAwarded: number;
    totalXp: number;
    currentLevel: number;
    currentTitle: string;
    leveledUp: boolean;
    newBadges: UserBadge[];
    streakUpdated: boolean;
    streakBonus: number;
    capReached: boolean;
}
