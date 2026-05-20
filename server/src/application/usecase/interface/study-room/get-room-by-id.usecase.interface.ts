import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetRoomByIdUsecase {
  execute(roomId: string): Promise<StudyRoomResponseDTO>;
}
