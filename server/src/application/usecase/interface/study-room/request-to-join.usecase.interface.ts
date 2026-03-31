import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";

export interface IRequestToJoinUsecase {
  execute(userId: string, roomId: string): Promise<RoomJoinRequestResponseDTO>;
}
