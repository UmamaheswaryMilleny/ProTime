import { inject, injectable } from 'tsyringe';
import type { ISendSubscriptionNotificationsUsecase } from '../../interface/subscription/send-subscription-notifications.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class SendSubscriptionNotificationsUsecase implements ISendSubscriptionNotificationsUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('ISocketService')
    private readonly socketService: ISocketService,
  ) {}

  async execute(): Promise<void> {
    logger.info('[SendSubscriptionNotificationsUsecase] Checking for expiring subscriptions...');

    // 1. Find subscriptions expiring within 3 days
    const expiringSoon = await this.subscriptionRepository.findExpiringSubscriptions(3);

    if (expiringSoon.length === 0) {
      logger.info('[SendSubscriptionNotificationsUsecase] No expiring subscriptions to notify.');
      return;
    }

    for (const sub of expiringSoon) {
      try {
        const expiryDate = sub.currentPeriodEnd 
          ? new Date(sub.currentPeriodEnd).toLocaleDateString() 
          : 'soon';

        // 2. Emit socket notification
        this.socketService.emitToUser(sub.userId, 'notification:new', {
          type: 'subscription_expiring',
          title: 'Subscription Expiring Soon 💎',
          message: `Your premium subscription will expire on ${expiryDate}. Renew now to keep your benefits!`,
        });

        // 3. Update notification sent timestamp
        await this.subscriptionRepository.updateByUserId(sub.userId, {
          lastExpiryNotificationSentAt: new Date(),
        });

        logger.info(`[SendSubscriptionNotificationsUsecase] Notified user ${sub.userId} about expiry.`);
      } catch (err) {
        logger.error(`[SendSubscriptionNotificationsUsecase] Error notifying user ${sub.userId}:`, err);
      }
    }
  }
}
