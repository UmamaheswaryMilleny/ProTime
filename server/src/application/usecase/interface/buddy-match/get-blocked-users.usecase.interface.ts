import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';

export interface IGetBlockedUsersUsecase {
  execute(userId: string): Promise<BuddyConnectionResponseDTO[]>;
}
