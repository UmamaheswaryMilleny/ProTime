import { CreateRoomRequestDTO, StudyRoomResponseDTO } from "../../../dtos/study-room.dto";

export interface ICreateRoomUsecase {
  execute(hostId: string, dto: CreateRoomRequestDTO): Promise<StudyRoomResponseDTO>;
}
