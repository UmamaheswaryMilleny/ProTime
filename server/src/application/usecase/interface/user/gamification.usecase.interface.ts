import type {
    GamificationResponseDTO,
    AwardXpResponseDTO,
    InitializeGamificationResponseDTO,
    UserBadgeResponseDTO
} from '../../../dto/user/response/gamification.response.dto'
import { XpSource } from '../../../../domain/enums/gamification.enums';

// Called inside RegisterUsecase after user is created.
// Creates GamificationEntity with all zeros + EARLY_BIRD title.
export interface IInitializeGamificationUsecase {
    execute(userId: string): Promise<InitializeGamificationResponseDTO>;
}


// Returns full gamification profile for the dashboard.
export interface IGetGamificationUsecase {
    execute(userId: string, isPremium: boolean): Promise<GamificationResponseDTO>;
}



// Returns AwardXpResponseDTO so frontend can show XP popup + level up 
//identifies what awarded the XP — used for badge condition checks
export interface IAwardXpUsecase {
    execute(params: {
        userId: string;
        xp: number;
        isPremium: boolean;
        source: XpSource;
        todoId?: string;  
    }): Promise<AwardXpResponseDTO>;
}




export interface IUpdateStreakUsecase {
    execute(userId: string): Promise<{
        streakUpdated: boolean;
        streakBonus: number;  
        currentStreak: number;
    }>;
}


// Called by AwardXpUsecase after XP is awarded.
// Returns list of newly earned badges (empty array if none).
export interface ICheckAndAwardBadgesUsecase {
    execute(params: {
        userId: string;
        isPremium: boolean;
        source: XpSource;   
    }): Promise<UserBadgeResponseDTO[]>;
}