import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IDeleteExpiredRoomsUsecase } from '../../application/usecase/interface/study-room/delete-expired-rooms.usecase.interface';
import { logger } from '../config/logger.config';

/**
 * Runs at 02:00 every day.
 * Finds all study rooms that have been in ENDED status for ≥ 3 days and
 * permanently removes them from the database.
 */
export const startDeleteExpiredRoomsCron = (): void => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('[DeleteExpiredRoomsCron] Starting daily expired-room cleanup...');
      const usecase = container.resolve<IDeleteExpiredRoomsUsecase>('IDeleteExpiredRoomsUsecase');
      await usecase.execute();
      logger.info('[DeleteExpiredRoomsCron] Finished daily expired-room cleanup.');
    } catch (error: unknown) {
      logger.error('[DeleteExpiredRoomsCron] Unexpected error:', error);
    }
  });
};
