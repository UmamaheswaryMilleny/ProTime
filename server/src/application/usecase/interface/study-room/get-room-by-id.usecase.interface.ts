import { StudyRoomResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IGetRoomByIdUsecase {
  execute(roomId: string): Promise<StudyRoomResponseDTO>;
}
