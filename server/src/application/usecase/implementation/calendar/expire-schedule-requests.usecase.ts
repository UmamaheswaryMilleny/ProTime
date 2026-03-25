import { inject, injectable } from 'tsyringe';
import type { IExpireScheduleRequestsUsecase } from '../../interface/calendar/expire-schedule-requests.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class ExpireScheduleRequestsUsecase implements IExpireScheduleRequestsUsecase {
  constructor(
    @inject('ISessionScheduleRequestRepository')
    private readonly requestRepo: ISessionScheduleRequestRepository,
  ) {}

  async execute(): Promise<void> {
    try {
      const now = new Date();
      // Find all PENDING requests past expiresAt
      const expired = await this.requestRepo.findExpiredRequests();

      if (expired.length > 0) {
        logger.info(`[Cron] Expiring ${expired.length} schedule requests`);
        await Promise.all(
          expired.map(r => this.requestRepo.updateConfirmStatus(r.id!, ScheduleConfirmStatus.EXPIRED, now))
        );
      }
    } catch (err) {
      logger.error('[ExpireScheduleRequestsUsecase] Error:', { error: err });
      throw err;
    }
  }
}
