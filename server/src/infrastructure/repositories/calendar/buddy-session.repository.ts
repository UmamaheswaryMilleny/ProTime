import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { BuddySessionModel, BuddySessionDocument } from '../../database/models/buddy-session.model';
import { BuddySessionInfraMapper } from '../../database/mappers/buddy-session.infra.mapper';
import type { IBuddySessionRepository } from '../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { BuddySessionEntity }      from '../../../domain/entities/calender.entities';
import { SessionStatus } from '../../../domain/enums/calendar.enums';

@injectable()
export class BuddySessionRepository
  extends BaseRepository<BuddySessionDocument, BuddySessionEntity>
  implements IBuddySessionRepository
{
  constructor() {
    super(BuddySessionModel, BuddySessionInfraMapper.toDomain);
  }

  async findByConversationId(
    conversationId: string,
  ): Promise<BuddySessionEntity[]> {
    const docs = await BuddySessionModel
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => BuddySessionInfraMapper.toDomain(d as BuddySessionDocument));
  }

  async findActiveByConversationId(
    conversationId: string,
  ): Promise<BuddySessionEntity | null> {
    const doc = await BuddySessionModel.findOne({
      conversationId,
      status: SessionStatus.ACTIVE,
    }).lean();
    if (!doc) return null;
    return BuddySessionInfraMapper.toDomain(doc as BuddySessionDocument);
  }

  // PLANNED sessions for both sides — for reminders
  async findPlannedByUserId(userId: string): Promise<BuddySessionEntity[]> {
    const docs = await BuddySessionModel.find({
      $or: [{ initiatorId: userId }, { participantId: userId }],
      status: SessionStatus.PLANNED,
    })
      .sort({ scheduledAt: 1 })
      .lean();
    return docs.map(d => BuddySessionInfraMapper.toDomain(d as BuddySessionDocument));
  }

  // PLANNED sessions where scheduledAt < cutoffTime — used by cron
  async findPlannedSessionsBefore(
    cutoffTime: Date,
  ): Promise<BuddySessionEntity[]> {
    const docs = await BuddySessionModel.find({
      status:      SessionStatus.PLANNED,
      scheduledAt: { $lt: cutoffTime },
    }).lean();
    return docs.map(d => BuddySessionInfraMapper.toDomain(d as BuddySessionDocument));
  }

  async updateStatus(
    id:     string,
    status: SessionStatus,
    data?:  Partial<Pick<BuddySessionEntity, 'startedAt' | 'endedAt'>>,
  ): Promise<BuddySessionEntity | null> {
    const update: Record<string, unknown> = { status };
    if (data?.startedAt !== undefined) update.startedAt = data.startedAt;
    if (data?.endedAt   !== undefined) update.endedAt   = data.endedAt;

    const doc = await BuddySessionModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    ).lean();

    if (!doc) return null;
    return BuddySessionInfraMapper.toDomain(doc as BuddySessionDocument);
  }
}
