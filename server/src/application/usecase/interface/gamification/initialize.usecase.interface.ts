
import { InitializeGamificationResponseDTO } from '../../../dto/gamification/response/initialize-gamification.response.dto';

// Called inside RegisterUsecase after user is created.
// Creates GamificationEntity with all zeros + EARLY_BIRD title.
export interface IInitializeGamificationUsecase {
    execute(userId: string): Promise<InitializeGamificationResponseDTO>;
}









