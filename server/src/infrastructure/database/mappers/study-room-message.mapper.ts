import { StudyRoomMessageEntity } from "../../../domain/entities/study-room-message.entity";
import { StudyRoomMessageDocument } from "../models/study-room-message.model";

export class StudyRoomMessageMapper {
  static toDomain(doc: StudyRoomMessageDocument): StudyRoomMessageEntity {
    return {
      id: doc._id.toString(),
      roomId: doc.roomId.toString(),
      senderId: doc.senderId.toString(),
      content: doc.content,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toModel(entity: Partial<StudyRoomMessageEntity>): any {
    const model: any = { ...entity };
    if (entity.id) model._id = entity.id;
    delete model.id;
    return model;
  }
}
