import { StudyRoomEntity } from "../../../domain/entities/study-room.entity";
import { StudyRoomDocument } from "../models/study-room.model";

export class StudyRoomMapper {
  static toDomain(doc: StudyRoomDocument): StudyRoomEntity {
    return {
      id: doc._id.toString(),
      hostId: doc.hostId.toString(),
      name: doc.name,
      description: doc.description,
      type: doc.type,
      status: doc.status,
      maxParticipants: doc.maxParticipants,
      tags: doc.tags,
      levelRequired: doc.levelRequired,
      features: doc.features,
      startTime: doc.startTime,
      endTime: doc.endTime,
      participantIds: doc.participantIds.map(id => id.toString()),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toModel(entity: Partial<StudyRoomEntity>): any {
    const model: any = { ...entity };
    if (entity.id) model._id = entity.id;
    delete model.id;
    return model;
  }
}
