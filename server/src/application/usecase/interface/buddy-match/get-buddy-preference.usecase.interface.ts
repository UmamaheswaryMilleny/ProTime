import type { BuddyPreferenceResponseDTO } from "../../../dto/buddy-match/response/buddy-preference.response.dto";

export interface IGetBuddyPreferenceUsecase {
  execute(userId: string): Promise<BuddyPreferenceResponseDTO | null>;
}