import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IExpireScheduleRequestsUsecase } from '../../application/usecase/interface/calendar/expire-schedule-requests.usecase.interface';
import { logger } from '../config/logger.config';

// Runs every hour
export const startExpireScheduleRequestsCron = (): void => {
  cron.schedule('0 * * * *', async () => {
    try {
      const usecase = container.resolve<IExpireScheduleRequestsUsecase>('IExpireScheduleRequestsUsecase');
      await usecase.execute();
    } catch (err) {
      logger.error('[Cron] ExpireScheduleRequests error:', { error: err });
    }
  });
};
