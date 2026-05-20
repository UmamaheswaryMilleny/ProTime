import { StudyRoomMessageResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetStudyRoomMessagesUsecase {
  execute(userId: string, roomId: string, page: number, limit: number): Promise<{ messages: StudyRoomMessageResponseDTO[], total: number }>;
}
