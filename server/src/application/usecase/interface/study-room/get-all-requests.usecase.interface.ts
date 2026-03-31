import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetAllRoomRequestsUsecase {
  execute(userId: string): Promise<{
    invitations: RoomJoinRequestResponseDTO[];
    joinRequests: RoomJoinRequestResponseDTO[];
  }>;
}
