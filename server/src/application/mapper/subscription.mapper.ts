import type { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import type { SubscriptionResponseDTO } from '../dto/subscription/response/subscription.response.dto';
import { SubscriptionPlan,SubscriptionStatus } from '../../domain/enums/subscription.enums';

export class SubscriptionMapper {
  static toResponse(entity: SubscriptionEntity): SubscriptionResponseDTO {
    const now = new Date();

    // Days remaining until currentPeriodEnd — 0 if no billing period or already expired
    let daysRemaining = 0;
    if (entity.currentPeriodEnd) {
      const msRemaining = entity.currentPeriodEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    }

    return {
      id:     entity.id,
      userId: entity.userId,
      plan:   entity.plan,
      status: entity.status,

      stripeCustomerId:     entity.stripeCustomerId,
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

      // ─── Computed fields ──────────────────────────────────────────────────
      isPremium: entity.plan === SubscriptionPlan.PREMIUM &&
                 entity.status === SubscriptionStatus.ACTIVE,
      isActive:  entity.status === SubscriptionStatus.ACTIVE,
      daysRemaining,

      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}