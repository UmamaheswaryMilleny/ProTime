import { StudyRoomResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IStartRoomUsecase {
  execute(hostId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
