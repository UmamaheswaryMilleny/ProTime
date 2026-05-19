import { SendStudyRoomMessageDTO, StudyRoomMessageResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface ISendStudyRoomMessageUsecase {
  execute(userId: string, roomId: string, dto: SendStudyRoomMessageDTO): Promise<StudyRoomMessageResponseDTO>;
}
