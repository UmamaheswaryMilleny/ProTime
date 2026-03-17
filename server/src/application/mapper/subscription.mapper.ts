import type { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import type { SubscriptionResponseDTO } from '../dto/subscription/response/subscription.response.dto';
import { SubscriptionPlan, SubscriptionStatus } from '../../domain/enums/subscription.enums';

export class SubscriptionMapper {
  static toResponse(entity: SubscriptionEntity): SubscriptionResponseDTO {
    const now = new Date();


    let daysRemaining = 0;
    if (entity.currentPeriodEnd) {
      //getTime() returns milliseconds. Subtract now from end date to get milliseconds remaining. 
      //Divide by 1000 * 60 * 60 * 24 to convert milliseconds → seconds → minutes → hours → days. 
      const msRemaining = entity.currentPeriodEnd.getTime() - now.getTime();
      //Math.ceil rounds up so 1.2 days shows as 2 not 1. Math.max(0, ...) prevents negative numbers if already expired.
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    }

    return {
      id: entity.id,
      userId: entity.userId,
      plan: entity.plan,
      status: entity.status,

      stripeCustomerId: entity.stripeCustomerId,
      stripeSubscriptionId: entity.stripeSubscriptionId,

      currentPeriodStart: entity.currentPeriodStart
        ? entity.currentPeriodStart.toISOString()
        : null,
      currentPeriodEnd: entity.currentPeriodEnd
        ? entity.currentPeriodEnd.toISOString()
        : null,

      cancelledAt: entity.cancelledAt
        ? entity.cancelledAt.toISOString()
        : undefined,


      isPremium: entity.plan === SubscriptionPlan.PREMIUM &&
        entity.status === SubscriptionStatus.ACTIVE,
      isActive: entity.status === SubscriptionStatus.ACTIVE,
      daysRemaining,

      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}