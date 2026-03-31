import { IBaseRepository } from "../base/base.repository.interface";
import { StudyRoomMessageEntity } from "../../entities/study-room-message.entity";

export interface IStudyRoomMessageRepository extends IBaseRepository<StudyRoomMessageEntity> {
  findByRoomId(roomId: string, page: number, limit: number): Promise<{ messages: StudyRoomMessageEntity[], total: number }>;
}
