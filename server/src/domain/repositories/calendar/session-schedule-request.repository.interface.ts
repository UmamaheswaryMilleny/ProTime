import type { IBaseRepository } from '../base/base.repository.interface';
import type { SessionScheduleRequestEntity }  from '../../entities/calender.entities';

export interface ISessionScheduleRequestRepository
  extends IBaseRepository<SessionScheduleRequestEntity> {

  findPendingByUserId(
    userId: string,
  ): Promise<SessionScheduleRequestEntity[]>;

  findBySessionId(
    sessionId: string,
  ): Promise<SessionScheduleRequestEntity | null>;

  // Find PENDING requests past expiresAt — used by cron job
  findExpiredRequests(): Promise<SessionScheduleRequestEntity[]>;

  updateConfirmStatus(
    id:          string,
    status:      SessionScheduleRequestEntity['confirmStatus'],
    respondedAt: Date,
  ): Promise<SessionScheduleRequestEntity | null>;
}
