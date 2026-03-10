import { XpSource } from "../../../../domain/enums/gamification.enums"; 
import { AwardXpResponseDTO } from "../../../dto/gamification/response/award-xp.response.dto";
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
