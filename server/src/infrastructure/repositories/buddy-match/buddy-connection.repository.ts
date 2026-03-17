import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { BaseRepository } from '../base.repository';
import { BuddyConnectionModel, BuddyConnectionDocument } from '../../database/models/buddy-connection.model';
import { BuddyConnectionMapper } from '../../database/mappers/buddy-connection.mapper';
import type { IBuddyConnectionRepository } from '../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { BuddyConnectionEntity } from '../../../domain/entities/buddy.entities';
import { BuddyConnectionStatus } from '../../../domain/enums/buddy.enums';

@injectable()
export class BuddyConnectionRepository
  extends BaseRepository<BuddyConnectionDocument, BuddyConnectionEntity>
  implements IBuddyConnectionRepository
{
  constructor() {
    super(BuddyConnectionModel, BuddyConnectionMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<BuddyConnectionEntity[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const docs = await BuddyConnectionModel
      .find({ $or: [{ userId: userObjectId }, { buddyId: userObjectId }] })
      .sort({ lastSessionAt: -1 })
      .lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  async findConnection(
    userId:  string,
    buddyId: string,
  ): Promise<BuddyConnectionEntity | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const buddyObjectId = new mongoose.Types.ObjectId(buddyId);
    const doc = await BuddyConnectionModel.findOne({
      $or: [
        { userId: userObjectId, buddyId: buddyObjectId },
        { userId: buddyObjectId, buddyId: userObjectId },
      ],
    }).lean();
    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }

  async countAcceptedThisMonth(userId: string): Promise<number> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return BuddyConnectionModel.countDocuments({
      $or: [{ userId: userObjectId }, { buddyId: userObjectId }],
      status:  BuddyConnectionStatus.CONNECTED,
      addedAt: { $gte: since },
    });
  }

  async findQualifiedConnections(
    userId:     string,
    minRating:  number,
    minMinutes: number,
  ): Promise<BuddyConnectionEntity[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const docs = await BuddyConnectionModel.find({
      $or: [{ userId: userObjectId }, { buddyId: userObjectId }],
      status:              BuddyConnectionStatus.CONNECTED,
      rating:              { $gte: minRating },
      totalSessionMinutes: { $gte: minMinutes },
    }).lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  async findPendingByRequesterId(requesterId: string): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel.find({
      userId: new mongoose.Types.ObjectId(requesterId),
      status: BuddyConnectionStatus.PENDING,
    }).lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  async findPendingByReceiverId(receiverId: string): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel.find({
      buddyId: new mongoose.Types.ObjectId(receiverId),
      status:  BuddyConnectionStatus.PENDING,
    }).lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  async updateStatus(
    connectionId: string,
    status:       BuddyConnectionStatus,
  ): Promise<BuddyConnectionEntity | null> {
    const update: Record<string, unknown> = { status };
    if (status === BuddyConnectionStatus.CONNECTED) {
      update.addedAt = new Date();
    }

    const doc = await BuddyConnectionModel.findByIdAndUpdate(
      connectionId,
      { $set: update },
      { new: true },
    ).lean();

    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }

  async updateSessionStats(
    userId:  string,
    buddyId: string,
    data:    Partial<Pick<BuddyConnectionEntity,
      | 'rating' | 'totalSessionsCompleted' | 'totalSessionMinutes' | 'lastSessionAt'
    >>,
  ): Promise<BuddyConnectionEntity | null> {
    const update = BuddyConnectionMapper.toPersistence(data);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const buddyObjectId = new mongoose.Types.ObjectId(buddyId);

    const doc = await BuddyConnectionModel.findOneAndUpdate(
      {
        $or: [
          { userId: userObjectId, buddyId: buddyObjectId },
          { userId: buddyObjectId, buddyId: userObjectId },
        ],
        status: BuddyConnectionStatus.CONNECTED,  // ← only update confirmed connections
      },
      { $set: update },
      { new: true },
    ).lean();

    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }

  // Returns all connections where this user initiated a block
  async findBlockedByUserId(userId: string): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel
      .find({
        blockedBy: userId,
        status:    BuddyConnectionStatus.BLOCKED,
      })
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  // Updates status and optionally sets blockedBy in one operation
  async updateStatusWithBlockedBy(
    connectionId: string,
    status:       BuddyConnectionStatus,
    blockedBy?:   string,
  ): Promise<BuddyConnectionEntity | null> {
    const $set: Record<string, unknown> = { status };

    if (status === BuddyConnectionStatus.CONNECTED) {
      $set['addedAt'] = new Date();
    }
    if (blockedBy !== undefined) {
      $set['blockedBy'] = blockedBy;
    }

    const doc = await BuddyConnectionModel.findByIdAndUpdate(
      connectionId,
      { $set },
      { new: true },
    ).lean();

    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }
}