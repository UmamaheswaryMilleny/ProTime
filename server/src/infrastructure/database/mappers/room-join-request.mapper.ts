import { RoomJoinRequestEntity } from "../../../domain/entities/room-join-request.entity";
import { RoomJoinRequestDocument } from "../models/room-join-request.model";

export class RoomJoinRequestMapper {
  static toDomain(doc: RoomJoinRequestDocument): RoomJoinRequestEntity {
    return {
      id: doc._id.toString(),
      roomId: doc.roomId.toString(),
      userId: doc.userId.toString(),
      status: doc.status,
      respondedAt: doc.respondedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toModel(entity: Partial<RoomJoinRequestEntity>): any {
    const model: any = { ...entity };
    if (entity.id) model._id = entity.id;
    delete model.id;
    return model;
  }
}
