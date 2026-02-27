import type { ISubscriptionEntity } from "../../entities/subscription.entity.js";

export interface ISubscriptionRepository {
  findActiveByUserId(
    userId: string
  ): Promise<ISubscriptionEntity | null>;

  // Store a subscription record when the user pays or renews
  save(subscription: ISubscriptionEntity): Promise<ISubscriptionEntity>;
}
