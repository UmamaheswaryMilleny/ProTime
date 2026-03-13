import { injectable } from 'tsyringe';
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

  // Returns all connections where user is either sender or receiver
  async findByUserId(userId: string): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel
      .find({ $or: [{ userId }, { buddyId: userId }] })
      .sort({ lastSessionAt: -1 })
      .lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  // Checks both directions: (A→B) OR (B→A)
  async findConnection(
    userId:  string,
    buddyId: string,
  ): Promise<BuddyConnectionEntity | null> {
    const doc = await BuddyConnectionModel.findOne({
      $or: [
        { userId, buddyId },
        { userId: buddyId, buddyId: userId },
      ],
    }).lean();
    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }

  // Rolling 30-day window — counts accepted connections on both sides
  async countAcceptedThisMonth(userId: string): Promise<number> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return BuddyConnectionModel.countDocuments({
      $or: [{ userId }, { buddyId: userId }],
      status:  BuddyConnectionStatus.CONNECTED,
      addedAt: { $gte: since },
    });
  }

  // Badge criteria: rating >= minRating AND totalSessionMinutes >= minMinutes
  async findQualifiedConnections(
    userId:     string,
    minRating:  number,
    minMinutes: number,
  ): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel.find({
      $or: [{ userId }, { buddyId: userId }],
      status:              BuddyConnectionStatus.CONNECTED,
      rating:              { $gte: minRating },
      totalSessionMinutes: { $gte: minMinutes },
    }).lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  // Incoming pending requests — receiver side only
  async findPendingByReceiverId(receiverId: string): Promise<BuddyConnectionEntity[]> {
    const docs = await BuddyConnectionModel.find({
      buddyId: receiverId,
      status:  BuddyConnectionStatus.PENDING,
    }).lean();
    return docs.map(d => BuddyConnectionMapper.toDomain(d as BuddyConnectionDocument));
  }

  // Sets addedAt automatically when status transitions to CONNECTED
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

  // Updates session stats after a 1:1 session ends — checks both directions
  async updateSessionStats(
    userId:  string,
    buddyId: string,
    data:    Partial<Pick<BuddyConnectionEntity,
      | 'rating' | 'totalSessionsCompleted' | 'totalSessionMinutes' | 'lastSessionAt'
    >>,
  ): Promise<BuddyConnectionEntity | null> {
    const update = BuddyConnectionMapper.toPersistence(data);

    const doc = await BuddyConnectionModel.findOneAndUpdate(
      {
        $or: [
          { userId, buddyId },
          { userId: buddyId, buddyId: userId },
        ],
      },
      { $set: update },
      { new: true },
    ).lean();

    if (!doc) return null;
    return BuddyConnectionMapper.toDomain(doc as BuddyConnectionDocument);
  }
}