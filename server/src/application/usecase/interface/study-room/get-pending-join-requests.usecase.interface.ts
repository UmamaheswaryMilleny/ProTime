import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetPendingJoinRequestsUsecase {
  execute(hostId: string, roomId: string): Promise<RoomJoinRequestResponseDTO[]>;
}
