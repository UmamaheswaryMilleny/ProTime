import { injectable } from "tsyringe";
import { BaseRepository } from "../base.repository";
import { StudyRoomDocument, StudyRoomModel } from "../../database/models/study-room.model";
import { StudyRoomEntity } from "../../../domain/entities/study-room.entity";
import { IStudyRoomRepository } from "../../../domain/repositories/study-room/study-room.repository.interface";
import { StudyRoomMapper } from "../../database/mappers/study-room.mapper";
import { RoomStatus, RoomType } from "../../../domain/enums/study-room.enums";

@injectable()
export class StudyRoomRepository extends BaseRepository<StudyRoomDocument, StudyRoomEntity> implements IStudyRoomRepository {
  constructor() {
    super(StudyRoomModel, StudyRoomMapper.toDomain, StudyRoomMapper.toModel);
  }

  async findAll(params: { type?: RoomType, status?: RoomStatus, search?: string, page: number, limit: number }): Promise<{ rooms: StudyRoomEntity[], total: number }> {
    const query: any = {};
    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.search) {
      query.name = { $regex: params.search, $options: 'i' };
    }

    const skip = (params.page - 1) * params.limit;
    
    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(params.limit).exec(),
      this.model.countDocuments(query).exec()
    ]);

    return { rooms: docs.map(StudyRoomMapper.toDomain), total };
  }

  async findByHostId(hostId: string): Promise<StudyRoomEntity[]> {
    const docs = await this.model.find({ hostId }).sort({ createdAt: -1 }).exec();
    return docs.map(StudyRoomMapper.toDomain);
  }

  async findLiveRooms(page: number, limit: number): Promise<{ rooms: StudyRoomEntity[], total: number }> {
    return this.findAll({ status: RoomStatus.LIVE, page, limit });
  }

  async addParticipant(roomId: string, userId: string): Promise<StudyRoomEntity | null> {
    const update = { $addToSet: { participantIds: userId } };
    const doc = await this.model.findByIdAndUpdate(roomId, update as any, { new: true }).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }

  async removeParticipant(roomId: string, userId: string): Promise<StudyRoomEntity | null> {
    const update = { $pull: { participantIds: userId } };
    const doc = await this.model.findByIdAndUpdate(roomId, update as any, { new: true }).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }

  async updateStatus(roomId: string, status: RoomStatus): Promise<StudyRoomEntity | null> {
    const doc = await this.model.findByIdAndUpdate(roomId, { status }, { new: true }).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }
}
