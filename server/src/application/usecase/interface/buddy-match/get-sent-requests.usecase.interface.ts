import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';


export interface IGetSentRequestsUsecase {
  execute(userId: string): Promise<BuddyConnectionResponseDTO[]>;
}
