import { SendStudyRoomMessageDTO, StudyRoomMessageResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface ISendStudyRoomMessageUsecase {
  execute(userId: string, roomId: string, dto: SendStudyRoomMessageDTO): Promise<StudyRoomMessageResponseDTO>;
}
