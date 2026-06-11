import { StudyRoomResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IGetRoomByIdUsecase {
  execute(roomId: string): Promise<StudyRoomResponseDTO>;
}
