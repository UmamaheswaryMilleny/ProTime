import { StudyRoomResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IGetMyRoomsUsecase {
  execute(hostId: string): Promise<StudyRoomResponseDTO[]>;
}
