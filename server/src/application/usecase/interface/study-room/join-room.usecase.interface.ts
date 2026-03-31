import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";

export interface IJoinRoomUsecase {
  execute(userId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
