import type { IBaseRepository } from '../base/base.repository.interface';
import type { SubscriptionEntity } from '../../entities/subscription.entity';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionEntity> {


  // Every user has exactly one subscription document
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;


  // Used by webhook handler to resolve which user a Stripe event belongs to
  findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionEntity | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null>;

  
  // Only fields explicitly provided are updated — others untouched
  updateByUserId(
    userId: string,
    data: Partial<Pick<SubscriptionEntity,
      | 'plan'
      | 'status'
      | 'stripeCustomerId'
      | 'stripeSubscriptionId'
      | 'currentPeriodStart'
      | 'currentPeriodEnd'
      | 'cancelledAt'
    >>
  ): Promise<SubscriptionEntity | null>;

  // Returns all PREMIUM/CANCELLED subscriptions where currentPeriodEnd < now
  // Used by cron job to batch-downgrade to FREE
  findExpiredSubscriptions(): Promise<SubscriptionEntity[]>;
}