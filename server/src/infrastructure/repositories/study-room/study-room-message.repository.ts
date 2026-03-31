import { injectable } from "tsyringe";
import { BaseRepository } from "../base.repository";
import { StudyRoomMessageDocument, StudyRoomMessageModel } from "../../database/models/study-room-message.model";
import { StudyRoomMessageEntity } from "../../../domain/entities/study-room-message.entity";
import { IStudyRoomMessageRepository } from "../../../domain/repositories/study-room/study-room-message.repository.interface";
import { StudyRoomMessageMapper } from "../../database/mappers/study-room-message.mapper";

@injectable()
export class StudyRoomMessageRepository extends BaseRepository<StudyRoomMessageDocument, StudyRoomMessageEntity> implements IStudyRoomMessageRepository {
  constructor() {
    super(StudyRoomMessageModel, StudyRoomMessageMapper.toDomain, StudyRoomMessageMapper.toModel);
  }

  async findByRoomId(roomId: string, page: number, limit: number): Promise<{ messages: StudyRoomMessageEntity[]; total: number; }> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.model.find({ roomId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments({ roomId }).exec()
    ]);
    return { messages: docs.map(StudyRoomMessageMapper.toDomain), total };
  }
}
