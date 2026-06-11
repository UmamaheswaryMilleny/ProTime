import { StudyRoomLimitResponseDTO } from "../../../dto/study-room/request/study-room.dto";


export interface ICheckCreationLimitUsecase {
  execute(userId: string): Promise<StudyRoomLimitResponseDTO>;
}
