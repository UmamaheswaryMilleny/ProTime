import { RoomJoinRequestResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IGetPendingJoinRequestsUsecase {
  execute(hostId: string, roomId: string): Promise<RoomJoinRequestResponseDTO[]>;
}
