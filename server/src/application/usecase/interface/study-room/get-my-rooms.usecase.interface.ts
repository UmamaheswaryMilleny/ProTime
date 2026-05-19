import { StudyRoomResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IGetMyRoomsUsecase {
  execute(hostId: string): Promise<StudyRoomResponseDTO[]>;
}
