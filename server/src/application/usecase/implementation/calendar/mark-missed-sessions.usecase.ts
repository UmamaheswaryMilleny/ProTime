import { inject, injectable } from 'tsyringe';
import type { IMarkMissedSessionsUsecase } from '../../interface/calendar/mark-missed-sessions.usecase.interface';
import type { IBuddySessionRepository }     from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import { SessionStatus } from '../../../../domain/enums/calendar.enums';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class MarkMissedSessionsUsecase implements IMarkMissedSessionsUsecase {
  constructor(
    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,
  ) {}

  async execute(): Promise<void> {
    try {
      const now = new Date();
      // Find all PLANNED sessions that should have started by now
      const missed = await this.sessionRepo.findPlannedSessionsBefore(now);

      if (missed.length > 0) {
        logger.info(`[Cron] Marking ${missed.length} sessions as MISSED`);
        await Promise.all(
          missed.map(s => this.sessionRepo.updateStatus(s.id!, SessionStatus.MISSED))
        );
      }
    } catch (err) {
      logger.error('[MarkMissedSessionsUsecase] Error:', { error: err });
      throw err;
    }
  }
}
