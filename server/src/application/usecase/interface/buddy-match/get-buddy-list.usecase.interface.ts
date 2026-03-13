import type { BuddyConnectionResponseDTO } from "../../../dto/buddy-match/response/buddy-connection.response.dto";

export interface IGetBuddyListUsecase {
  execute(userId: string): Promise<BuddyConnectionResponseDTO[]>;
}