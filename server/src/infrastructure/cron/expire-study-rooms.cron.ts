import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IExpireStudyRoomsUsecase } from '../../application/usecase/interface/study-room/expire-study-rooms.usecase.interface';
import { logger } from '../config/logger.config';

/**
 * Runs every minute (* * * * *).
 * Finds all study rooms that are currently LIVE and have been active
 * for > 30 minutes + sessionExtensionSeconds + 5 minutes grace period.
 * Automatically marks them as ENDED, clears participantIds, and sends socket emit.
 */
export const startExpireStudyRoomsCron = (): void => {
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('[ExpireStudyRoomsCron] Starting minutely active study rooms check...');
      const usecase = container.resolve<IExpireStudyRoomsUsecase>('IExpireStudyRoomsUsecase');
      await usecase.execute();
      logger.info('[ExpireStudyRoomsCron] Finished minutely active study rooms check.');
    } catch (error: unknown) {
      logger.error('[ExpireStudyRoomsCron] Unexpected error:', error);
    }
  });
};
