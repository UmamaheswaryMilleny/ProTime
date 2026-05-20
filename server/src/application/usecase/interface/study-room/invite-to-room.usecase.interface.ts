import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";

export interface IInviteToRoomUsecase {
  execute(hostId: string, roomId: string, userIdToInvite: string): Promise<RoomJoinRequestResponseDTO>;
}
