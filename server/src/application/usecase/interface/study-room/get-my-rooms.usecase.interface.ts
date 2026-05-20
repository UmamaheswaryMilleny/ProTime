import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetMyRoomsUsecase {
  execute(hostId: string): Promise<StudyRoomResponseDTO[]>;
}
