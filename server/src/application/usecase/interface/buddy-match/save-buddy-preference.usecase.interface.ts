import type { SaveBuddyPreferenceRequestDTO } from '../../../dto/buddy-match/request/save-buddy-preference.request.dto';
import type { BuddyPreferenceResponseDTO } from '../../../dto/buddy-match/response/buddy-preference.response.dto';

export interface ISaveBuddyPreferenceUsecase {
  execute(
    userId:    string,
    dto:       SaveBuddyPreferenceRequestDTO,
  ): Promise<BuddyPreferenceResponseDTO>;
}