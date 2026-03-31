import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";

export interface IStartRoomUsecase {
  execute(hostId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
