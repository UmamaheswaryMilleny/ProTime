import mongoose from 'mongoose';
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

  async findAll(params: { type?: RoomType, status?: RoomStatus, search?: string, page: number, limit: number, excludeEnded?: boolean }): Promise<{ rooms: StudyRoomEntity[], total: number }> {
    const query: any = {};
    if (params.type) query.type = params.type;

    if (params.status) {
      // Explicit status filter — honour it exactly
      query.status = params.status;
    } else if (params.excludeEnded) {
      // Explore tab: exclude ENDED rooms AND stale WAITING rooms whose session
      // time has already passed (startTime + 4 h buffer, or endTime < now).
      const nowStr = new Date().toISOString();
      const fourHoursAgoStr = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

      query.$or = [
        // Always include LIVE sessions
        { status: RoomStatus.LIVE },
        // Include WAITING rooms that haven't started yet or start is recent
        {
          status: RoomStatus.WAITING,
          $or: [
            // Has explicit end time still in the future
            { endTime: { $gt: nowStr } },
            // Has start time that was within the last 4 hours (grace window), no endTime
            {
              startTime: { $gt: fourHoursAgoStr },
              $or: [
                { endTime: { $exists: false } },
                { endTime: null }
              ]
            },
            // Immediate rooms (no startTime set or set to 'IMMEDIATE') — always show
            { startTime: 'IMMEDIATE' },
            { startTime: { $exists: false } },
            { startTime: null }
          ],
        },
      ];
    }

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
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const doc = await this.model.findOneAndUpdate(
      {
        _id: roomId,
        $or: [
          { participantIds: userObjectId },
          { $expr: { $lt: [{ $size: "$participantIds" }, "$maxParticipants"] } }
        ]
      },
      { $addToSet: { participantIds: userObjectId } } as any,
      { new: true }
    ).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }

  async removeParticipant(roomId: string, userId: string): Promise<StudyRoomEntity | null> {
    const update = { $pull: { participantIds: userId } };
    const doc = await this.model.findByIdAndUpdate(roomId, update as any, { new: true }).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }

  async updateStatus(roomId: string, status: RoomStatus): Promise<StudyRoomEntity | null> {
    const update: any = { status };
    if (status === RoomStatus.LIVE) {
      update.sessionStartedAt = new Date();
    }
    const doc = await this.model.findByIdAndUpdate(roomId, update, { new: true }).exec();
    return doc ? StudyRoomMapper.toDomain(doc) : null;
  }

  async findEndedBefore(date: Date): Promise<StudyRoomEntity[]> {
    const docs = await this.model
      .find({ status: RoomStatus.ENDED, updatedAt: { $lt: date } })
      .exec();
    return docs.map(StudyRoomMapper.toDomain);
  }

  async countCreatedByHostInMonth(hostId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.model.countDocuments({
      hostId: new mongoose.Types.ObjectId(hostId),
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();
  }

  async countJoinedOrHostedInMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return this.model.countDocuments({
      $or: [
        { hostId: userObjectId },
        { participantIds: userObjectId }
      ],
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();
  }
}
