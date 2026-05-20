import { inject, injectable } from 'tsyringe';
import type { IExpireSubscriptionsUsecase } from '../../interface/subscription/expire-subscriptions.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';
import { logger } from '../../../../infrastructure/config/logger.config';

/**
 * Fallback safety-net use case — runs once daily via cron.
 *
 * Stripe fires `customer.subscription.deleted` when a subscription ends, but
 * webhooks can be missed (network blip, Stripe outage, etc.).  This cron
 * catches any subscription whose `currentPeriodEnd` has already passed but
 * whose DB record still shows plan=PREMIUM / status=ACTIVE|CANCELLED, and
 * force-expires them so users never get free premium access by accident.
 *
 * Fix 2 (user.isPremium sync): every downgrade here also sets
 * `user.isPremium = false` on the UserModel, so both documents are always
 * consistent regardless of whether the Stripe webhook fired.
 */
@injectable()
export class ExpireSubscriptionsUsecase implements IExpireSubscriptionsUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @inject('ISocketService')
    private readonly socketService: ISocketService,
  ) {}

  async execute(): Promise<void> {
    logger.info('[ExpireSubscriptionsUsecase] Scanning for missed-webhook expired subscriptions...');

    // Query: PREMIUM plan, period already ended, but status is still ACTIVE or CANCELLED
    const expiredSubs = await this.subscriptionRepository.findExpiredSubscriptions();

    if (expiredSubs.length === 0) {
      logger.info('[ExpireSubscriptionsUsecase] No missed-webhook expirations found.');
      return;
    }

    logger.warn(`[ExpireSubscriptionsUsecase] Found ${expiredSubs.length} subscription(s) to force-expire.`);

    for (const sub of expiredSubs) {
      try {
        // ① Downgrade subscription record to FREE / EXPIRED
        // ② Sync user.isPremium = false so UserModel is never stale  (Fix 2)
        await Promise.all([
          this.subscriptionRepository.updateByUserId(sub.userId, {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.EXPIRED,
          }),
          this.userRepository.updateById(sub.userId, { isPremium: false }),
        ]);

        // ③ Notify user in real-time if they happen to be online
        this.socketService.emitToUser(sub.userId, 'notification:new', {
          type: 'subscription_expired',
          title: 'Subscription Expired 💎',
          message:
            'Your premium subscription has expired. You have been moved to the free plan. Renew anytime to restore your benefits!',
        });

        logger.info(`[ExpireSubscriptionsUsecase] Force-expired subscription for user ${sub.userId}`);
      } catch (err) {
        // Log but continue — one failure must not block the rest of the batch
        logger.error(`[ExpireSubscriptionsUsecase] Failed to expire subscription for user ${sub.userId}:`, err);
      }
    }
  }
}
