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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPersistence(
    data: Partial<BuddyConnectionEntity>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId !== undefined) result.userId = data.userId;
    if (data.buddyId !== undefined) result.buddyId = data.buddyId;
    if (data.status !== undefined) result.status = data.status;
    if (data.totalSessionsCompleted !== undefined)
      result.totalSessionsCompleted = data.totalSessionsCompleted;
    if (data.totalSessionMinutes !== undefined)
      result.totalSessionMinutes = data.totalSessionMinutes;
    if ('addedAt' in data) result.addedAt = data.addedAt ?? null;
    if ('blockedBy' in data) result.blockedBy = data.blockedBy ?? null;
    if ('rating' in data) result.rating = data.rating ?? null;
    if ('lastSessionAt' in data)
      result.lastSessionAt = data.lastSessionAt ?? null;

    return result;
  }
}
