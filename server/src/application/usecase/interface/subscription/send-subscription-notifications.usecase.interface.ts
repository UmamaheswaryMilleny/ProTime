import type { SubscriptionEntity } from '../../../../domain/entities/subscription.entity';

export interface ISendSubscriptionNotificationsUsecase {
  execute(): Promise<void>;
}
