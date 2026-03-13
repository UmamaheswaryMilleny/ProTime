import type { FindBuddyMatchesRequestDTO } from '../../../dto/buddy-match/request/find-buddy-matches.request.dto';
import type { PaginatedBuddyProfileResponseDTO } from '../../../dto/buddy-match/response/paginated-buddy-profile.response.dto';

export interface IFindBuddyMatchesUsecase {
  execute(
    userId:    string,
    dto:       FindBuddyMatchesRequestDTO,
  ): Promise<PaginatedBuddyProfileResponseDTO>;
}