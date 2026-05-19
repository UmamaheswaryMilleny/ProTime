import { CreateRoomRequestDTO, StudyRoomResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface ICreateRoomUsecase {
  execute(hostId: string, dto: CreateRoomRequestDTO): Promise<StudyRoomResponseDTO>;
}
