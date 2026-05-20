import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IExpireSubscriptionsUsecase } from '../../application/usecase/interface/subscription/expire-subscriptions.usecase.interface';
import { logger } from '../config/logger.config';

/**
 * Runs once a day at 01:00 (server time).
 *
 * Finds any PREMIUM subscriptions whose billing period has ended but whose
 * Stripe `customer.subscription.deleted` webhook was never received, and
 * force-downgrades them to FREE / EXPIRED.
 *
 * This is a safety net — in a healthy Stripe integration the webhook handles
 * expiry first, and this cron simply finds nothing to do.
 */
export const startExpireSubscriptionsCron = (): void => {
  // Run every day at 01:00 — slightly offset from midnight so it doesn't
  // collide with the subscription-notifications cron (00:00).
  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('[ExpireSubscriptionsCron] Starting daily missed-webhook expiry check...');
      const usecase = container.resolve<IExpireSubscriptionsUsecase>('IExpireSubscriptionsUsecase');
      await usecase.execute();
      logger.info('[ExpireSubscriptionsCron] Finished daily missed-webhook expiry check.');
    } catch (error) {
      logger.error('[ExpireSubscriptionsCron] Unexpected error:', error);
    }
  });
};
