import { RoomJoinRequestResponseDTO } from  "../../../dto/study-room/request/study-room.dto";


export interface IGetAllRoomRequestsUsecase {
  execute(userId: string): Promise<{
    invitations: RoomJoinRequestResponseDTO[];
    joinRequests: RoomJoinRequestResponseDTO[];
  }>;
}
