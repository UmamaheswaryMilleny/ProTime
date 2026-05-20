import { StudyRoomLimitResponseDTO } from "../../../dtos/study-room.dto";

export interface ICheckCreationLimitUsecase {
  execute(userId: string): Promise<StudyRoomLimitResponseDTO>;
}
