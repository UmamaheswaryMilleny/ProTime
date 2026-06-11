import { RoomJoinRequestResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IInviteToRoomUsecase {
  execute(hostId: string, roomId: string, userIdToInvite: string): Promise<RoomJoinRequestResponseDTO>;
}
