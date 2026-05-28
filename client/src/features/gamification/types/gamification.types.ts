export interface UserBadge {
    id: string;
    badgeKey: string;
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    earnedAt: string;
}

export interface BadgeDefinition {
    key: string;
    name: string;
    description: string;
    iconUrl: string | null;
    xpReward: number;
    premiumRequired: boolean;
    category: string;
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
    activeBadges: BadgeDefinition[];
    createdAt: string;
    updatedAt: string;
}

export interface AwardXpResponse {
    xpAwarded: number;
    totalXp: number;
    currentLevel: number;
    rawLevel?: number;
    currentTitle: string;
    leveledUp: boolean;
    newBadges: UserBadge[];
    streakUpdated: boolean;
    streakBonus: number;
    capReached: boolean;
}
