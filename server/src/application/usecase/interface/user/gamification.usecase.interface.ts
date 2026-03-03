import type {
    GamificationResponseDTO,
    AwardXpResponseDTO,
    InitializeGamificationResponseDTO,
} from '../../../dto/user/response/gamification.response.dto'

// ─── Initialize Gamification ──────────────────────────────────────────────────
// Called inside RegisterUsecase after user is created.
// Creates GamificationEntity with all zeros + EARLY_BIRD title.
export interface IInitializeGamificationUsecase {
    execute(userId: string): Promise<InitializeGamificationResponseDTO>;
}

// ─── Get Gamification ─────────────────────────────────────────────────────────
// Returns full gamification profile for the dashboard.
// Includes XP, level, title, streak, daily counters, earned badges.
// Also handles lazy daily reset — resets counters if lastDailyResetDate < today.
export interface IGetGamificationUsecase {
    execute(userId: string, isPremium: boolean): Promise<GamificationResponseDTO>;
}

// ─── Award XP ─────────────────────────────────────────────────────────────────
// Called by CompleteTodoUsecase after a todo is completed.
// Awards XP, checks level up, checks streak, checks badges.
// Returns AwardXpResponseDTO so frontend can show XP popup + level up animation.
//
// source: identifies what awarded the XP — used for badge condition checks
// e.g. 'TODO_HIGH' | 'TODO_MEDIUM' | 'TODO_LOW' | 'STREAK_BONUS'
export interface IAwardXpUsecase {
    execute(params: {
        userId: string;
        xp: number;
        isPremium: boolean;
        source: XpSource;
        todoId?: string;   // provided for task-based sources — used for badge checks
    }): Promise<AwardXpResponseDTO>;
}

export type XpSource =
    | 'TODO_LOW'
    | 'TODO_MEDIUM'
    | 'TODO_HIGH'
    | 'STREAK_BONUS'
    | 'BADGE_BONUS';

// ─── Update Streak ────────────────────────────────────────────────────────────
// Called by AwardXpUsecase when a todo is completed.
// Checks if streak should increment, reset, or stay the same.
// Returns streak bonus XP if a milestone was hit (0 otherwise).
export interface IUpdateStreakUsecase {
    execute(userId: string): Promise<{
        streakUpdated: boolean;
        streakBonus: number;   // XP to award from streak milestone (may be 0)
        currentStreak: number;
    }>;
}

// ─── Check And Award Badges ───────────────────────────────────────────────────
// Called by AwardXpUsecase after XP is awarded.
// Checks all active badge definitions against user's current stats.
// Awards any newly qualifying badges and their XP bonuses.
// Returns list of newly earned badges (empty array if none).
export interface ICheckAndAwardBadgesUsecase {
    execute(params: {
        userId: string;
        isPremium: boolean;
        source: XpSource;   // narrows which badges to check — avoids checking all
    }): Promise<import('../../../dto/user/response/gamification.response.dto.js').UserBadgeResponseDTO[]>;
}