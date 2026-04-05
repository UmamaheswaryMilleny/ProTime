import cron from 'node-cron';
import { container } from 'tsyringe';
import type { ISendSubscriptionNotificationsUsecase } from '../../application/usecase/interface/subscription/send-subscription-notifications.usecase.interface';
import { logger } from '../config/logger.config';

export const startSubscriptionNotificationsCron = () => {
  // Run once a day at midnight (00:00)
  // or for testing/demo purposes, we could run it more frequently. 
  // Let's stick to daily for production feel.
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('[SubscriptionNotificationsCron] Starting scheduled notification check...');
      const usecase = container.resolve<ISendSubscriptionNotificationsUsecase>('ISendSubscriptionNotificationsUsecase');
      await usecase.execute();
      logger.info('[SubscriptionNotificationsCron] Finished scheduled notification check.');
    } catch (error) {
      logger.error('[SubscriptionNotificationsCron] Error:', error);
    }
  });
};
