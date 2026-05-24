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
      
      // 1. Find all PLANNED sessions that should have started by now with a 15-minute grace window
      const missedGraceMs = 15 * 60 * 1000;
      const missedCutoff = new Date(now.getTime() - missedGraceMs);
      const missed = await this.sessionRepo.findPlannedSessionsBefore(missedCutoff);

      if (missed.length > 0) {
        logger.info(`[Cron] Marking ${missed.length} sessions as MISSED`);
        await Promise.all(
          missed.map(s => this.sessionRepo.updateStatus(s.id!, SessionStatus.MISSED))
        );
      }

      // 2. Find all ACTIVE sessions that have been running for more than 2 hours and auto-complete them
      const activeLimitMs = 120 * 60 * 1000;
      const activeCutoff = new Date(now.getTime() - activeLimitMs);
      const activeToComplete = await this.sessionRepo.findActiveSessionsBefore(activeCutoff);

      if (activeToComplete.length > 0) {
        logger.info(`[Cron] Auto-completing ${activeToComplete.length} long-running ACTIVE sessions`);
        await Promise.all(
          activeToComplete.map(s => this.sessionRepo.updateStatus(s.id!, SessionStatus.COMPLETED, { endedAt: now }))
        );
      }
    } catch (err: unknown) {
      logger.error('[MarkMissedSessionsUsecase] Error:', { error: err });
      throw err;
    }
  }
}
