import { XpSource } from "../../../../domain/enums/gamification.enums";
import { UserBadgeResponseDTO } from "../../../dto/gamification/response/user-badge.response.dto";
// Called by AwardXpUsecase after XP is awarded.
// Returns list of newly earned badges (empty array if none).
export interface ICheckAndAwardBadgesUsecase {
    execute(params: {
        userId: string;
        isPremium: boolean;
        source: XpSource;   
    }): Promise<UserBadgeResponseDTO[]>;
}