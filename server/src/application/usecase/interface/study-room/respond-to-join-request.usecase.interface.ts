import { RespondToJoinRequestDTO, RoomJoinRequestResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IRespondToJoinRequestUsecase {
  execute(hostId: string, requestId: string, dto: RespondToJoinRequestDTO): Promise<RoomJoinRequestResponseDTO>;
}
