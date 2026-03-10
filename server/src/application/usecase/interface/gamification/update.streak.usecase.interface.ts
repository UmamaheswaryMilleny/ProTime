
export interface IUpdateStreakUsecase {
    execute(userId: string,isPremium:boolean): Promise<{
        streakUpdated: boolean;
        streakBonus: number;  
        currentStreak: number;
    }>;
}
