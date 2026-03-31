import { SendStudyRoomMessageDTO, StudyRoomMessageResponseDTO } from "../../../dtos/study-room.dto";

export interface ISendStudyRoomMessageUsecase {
  execute(userId: string, roomId: string, dto: SendStudyRoomMessageDTO): Promise<StudyRoomMessageResponseDTO>;
}
