import { StudyRoomMessageResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IGetStudyRoomMessagesUsecase {
  execute(userId: string, roomId: string, page: number, limit: number): Promise<{ messages: StudyRoomMessageResponseDTO[], total: number }>;
}
