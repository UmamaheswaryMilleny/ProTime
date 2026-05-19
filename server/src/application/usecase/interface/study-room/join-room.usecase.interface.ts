import { StudyRoomResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IJoinRoomUsecase {
  execute(userId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
