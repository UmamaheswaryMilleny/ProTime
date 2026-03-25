import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IMarkMissedSessionsUsecase } from '../../application/usecase/interface/calendar/mark-missed-sessions.usecase.interface';
import { logger } from '../config/logger.config';

// Runs every 5 minutes
export const startMarkMissedSessionsCron = (): void => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const usecase = container.resolve<IMarkMissedSessionsUsecase>('IMarkMissedSessionsUsecase');
      await usecase.execute();
    } catch (err) {
      logger.error('[Cron] MarkMissedSessions error:', { error: err });
    }
  });
};
