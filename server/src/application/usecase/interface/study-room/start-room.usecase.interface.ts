import { StudyRoomResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IStartRoomUsecase {
  execute(hostId: string, roomId: string): Promise<StudyRoomResponseDTO>;
}
