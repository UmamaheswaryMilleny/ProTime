import { injectable } from "tsyringe";
import { BaseRepository } from "../base.repository";
import { RoomJoinRequestDocument, RoomJoinRequestModel } from "../../database/models/room-join-request.model";
import { RoomJoinRequestEntity } from "../../../domain/entities/room-join-request.entity";
import { IRoomJoinRequestRepository } from "../../../domain/repositories/study-room/room-join-request.repository.interface";
import { RoomJoinRequestMapper } from "../../database/mappers/room-join-request.mapper";
import { JoinRequestStatus } from "../../../domain/enums/study-room.enums";

@injectable()
export class RoomJoinRequestRepository extends BaseRepository<RoomJoinRequestDocument, RoomJoinRequestEntity> implements IRoomJoinRequestRepository {
  constructor() {
    super(RoomJoinRequestModel, RoomJoinRequestMapper.toDomain, RoomJoinRequestMapper.toModel);
  }

  async findByRoomId(roomId: string): Promise<RoomJoinRequestEntity[]> {
    const docs = await this.model.find({ roomId }).sort({ createdAt: -1 }).exec();
    return docs.map(RoomJoinRequestMapper.toDomain);
  }

  async findPendingByUserId(userId: string): Promise<RoomJoinRequestEntity[]> {
    const docs = await this.model.find({ userId, status: JoinRequestStatus.PENDING }).sort({ createdAt: -1 }).exec();
    return docs.map(RoomJoinRequestMapper.toDomain);
  }

  async findPendingByRoomId(roomId: string): Promise<RoomJoinRequestEntity[]> {
    const docs = await this.model.find({ roomId, status: JoinRequestStatus.PENDING }).sort({ createdAt: -1 }).exec();
    return docs.map(RoomJoinRequestMapper.toDomain);
  }

  async findPendingByRoomIds(roomIds: string[]): Promise<RoomJoinRequestEntity[]> {
    const docs = await this.model.find({ roomId: { $in: roomIds }, status: JoinRequestStatus.PENDING }).sort({ createdAt: -1 }).exec();
    return docs.map(RoomJoinRequestMapper.toDomain);
  }

  async findInvitationsByUserId(userId: string): Promise<RoomJoinRequestEntity[]> {
    const docs = await this.model.find({ userId, status: JoinRequestStatus.INVITED }).sort({ createdAt: -1 }).exec();
    return docs.map(RoomJoinRequestMapper.toDomain);
  }

  async findExistingRequest(roomId: string, userId: string): Promise<RoomJoinRequestEntity | null> {
    const doc = await this.model.findOne({ roomId, userId }).exec();
    return doc ? RoomJoinRequestMapper.toDomain(doc) : null;
  }

  async updateStatus(id: string, status: JoinRequestStatus, respondedAt: Date): Promise<RoomJoinRequestEntity | null> {
    const doc = await this.model.findByIdAndUpdate(id, { status, respondedAt }, { new: true }).exec();
    return doc ? RoomJoinRequestMapper.toDomain(doc) : null;
  }
}
