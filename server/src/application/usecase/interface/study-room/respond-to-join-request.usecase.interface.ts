import { RespondToJoinRequestDTO, RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";

export interface IRespondToJoinRequestUsecase {
  execute(hostId: string, requestId: string, dto: RespondToJoinRequestDTO): Promise<RoomJoinRequestResponseDTO>;
}
