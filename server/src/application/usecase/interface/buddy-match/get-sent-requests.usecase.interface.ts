import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';

/**
 * Usecase to retrieve all buddies the current user has sent requests to
 * that are currently in PENDING state.
 */
export interface IGetSentRequestsUsecase {
  execute(userId: string): Promise<BuddyConnectionResponseDTO[]>;
}
