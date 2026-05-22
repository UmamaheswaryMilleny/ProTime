import mongoose from 'mongoose';
import type { BuddyConnectionDocument } from '../models/buddy-connection.model';
import type { BuddyConnectionEntity } from '../../../domain/entities/buddy.entities';

export class BuddyConnectionMapper {
  static toDomain(doc: BuddyConnectionDocument): BuddyConnectionEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      buddyId: doc.buddyId.toString(),
      status: doc.status,
      addedAt: doc.addedAt ?? undefined,
      blockedBy: doc.blockedBy?.toString() ?? undefined,
      rating: doc.rating ?? undefined,
      totalSessionsCompleted: doc.totalSessionsCompleted,
      totalSessionMinutes: doc.totalSessionMinutes,
      lastSessionAt: doc.lastSessionAt ?? undefined,
      ratingSum: doc.ratingSum ?? 0,
      ratingCount: doc.ratingCount ?? 0,
      averageRating: doc.averageRating ?? undefined,
      ratedUserIds: doc.ratedUserIds?.map(id => id.toString()) ?? [],
      ratings: doc.ratings?.map(r => ({ raterId: r.raterId.toString(), rating: r.rating })) ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPersistence(
    data: Partial<BuddyConnectionEntity>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId !== undefined) result.userId = new mongoose.Types.ObjectId(data.userId);
    if (data.buddyId !== undefined) result.buddyId = new mongoose.Types.ObjectId(data.buddyId);
    if (data.status !== undefined) result.status = data.status;
    if (data.totalSessionsCompleted !== undefined)
      result.totalSessionsCompleted = data.totalSessionsCompleted;
    if (data.totalSessionMinutes !== undefined)
      result.totalSessionMinutes = data.totalSessionMinutes;
    if ('addedAt' in data) result.addedAt = data.addedAt ?? null;
    if ('blockedBy' in data) result.blockedBy = data.blockedBy ? new mongoose.Types.ObjectId(data.blockedBy) : null;
    if ('rating' in data) result.rating = data.rating ?? null;
    if ('lastSessionAt' in data)
      result.lastSessionAt = data.lastSessionAt ?? null;

    if (data.ratingSum !== undefined) result.ratingSum = data.ratingSum;
    if (data.ratingCount !== undefined) result.ratingCount = data.ratingCount;
    if ('averageRating' in data) result.averageRating = data.averageRating ?? null;
    if (data.ratedUserIds !== undefined) {
      result.ratedUserIds = data.ratedUserIds.map(id => new mongoose.Types.ObjectId(id));
    }
    if (data.ratings !== undefined) {
      result.ratings = data.ratings.map(r => ({
        raterId: new mongoose.Types.ObjectId(r.raterId),
        rating: r.rating,
      }));
    }

    return result;
  }
}
