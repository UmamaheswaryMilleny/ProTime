import { RoomJoinRequestResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IRequestToJoinUsecase {
  execute(userId: string, roomId: string): Promise<RoomJoinRequestResponseDTO>;
}
