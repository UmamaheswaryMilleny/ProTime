import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { SessionScheduleRequestModel, SessionScheduleRequestDocument } from '../../database/models/session-shedule-request.model';
import { SessionScheduleRequestInfraMapper } from '../../database/mappers/session-shedule-request.infra.mapper';
import type { ISessionScheduleRequestRepository } from '../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { SessionScheduleRequestEntity }      from '../../../domain/entities/calender.entities';
import { ScheduleConfirmStatus } from '../../../domain/enums/calendar.enums';

@injectable()
export class SessionScheduleRequestRepository
  extends BaseRepository<SessionScheduleRequestDocument, SessionScheduleRequestEntity>
  implements ISessionScheduleRequestRepository
{
  constructor() {
    super(SessionScheduleRequestModel, SessionScheduleRequestInfraMapper.toDomain);
  }

  // Pending requests where this user is the receiver
  async findPendingByUserId(
    userId: string,
  ): Promise<SessionScheduleRequestEntity[]> {
    const docs = await SessionScheduleRequestModel
      .find({
        proposedTo:    userId,
        confirmStatus: ScheduleConfirmStatus.PENDING,
      })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => SessionScheduleRequestInfraMapper.toDomain(d as SessionScheduleRequestDocument));
  }

  // Check if a request already exists for this session
  async findBySessionId(
    sessionId: string,
  ): Promise<SessionScheduleRequestEntity | null> {
    const doc = await SessionScheduleRequestModel
      .findOne({ sessionId, confirmStatus: ScheduleConfirmStatus.PENDING })
      .lean();
    if (!doc) return null;
    return SessionScheduleRequestInfraMapper.toDomain(doc as SessionScheduleRequestDocument);
  }

  // PENDING requests past expiresAt — used by cron job
  async findExpiredRequests(): Promise<SessionScheduleRequestEntity[]> {
    const docs = await SessionScheduleRequestModel
      .find({
        confirmStatus: ScheduleConfirmStatus.PENDING,
        expiresAt:     { $lt: new Date() },
      })
      .lean();
    return docs.map(d => SessionScheduleRequestInfraMapper.toDomain(d as SessionScheduleRequestDocument));
  }

  async updateConfirmStatus(
    id:          string,
    status:      ScheduleConfirmStatus,
    respondedAt: Date,
  ): Promise<SessionScheduleRequestEntity | null> {
    const doc = await SessionScheduleRequestModel.findByIdAndUpdate(
      id,
      { $set: { confirmStatus: status, respondedAt } },
      { new: true },
    ).lean();
    if (!doc) return null;
    return SessionScheduleRequestInfraMapper.toDomain(doc as SessionScheduleRequestDocument);
  }
}
