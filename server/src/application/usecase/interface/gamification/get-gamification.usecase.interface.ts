import { GamificationResponseDTO } from "../../../dto/gamification/response/gamification.response.dto";
// Returns full gamification profile for the dashboard.
export interface IGetGamificationUsecase {
    execute(userId: string, isPremium: boolean): Promise<GamificationResponseDTO>;
}

