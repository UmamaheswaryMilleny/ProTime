import { StudyRoomResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IJoinRoomUsecase {
  execute(userId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
