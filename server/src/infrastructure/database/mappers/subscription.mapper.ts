import type { SubscriptionDocument } from '../models/subscription.model';
import type { SubscriptionEntity } from '../../../domain/entities/subscription.entity';

export class SubscriptionInfraMapper {

  static toDomain(doc: SubscriptionDocument): SubscriptionEntity {
    return {
      id: (doc._id as object).toString(),
      userId: doc.userId.toString(),
      plan: doc.plan,
      status: doc.status,


      stripeCustomerId: doc.stripeCustomerId ?? undefined,
      stripeSubscriptionId: doc.stripeSubscriptionId ?? undefined,


      currentPeriodStart: doc.currentPeriodStart ?? new Date(),
      currentPeriodEnd: doc.currentPeriodEnd ?? new Date(),


      cancelledAt: doc.cancelledAt ?? undefined,
      aiUsageCount: doc.aiUsageCount ?? 0,
      lastAiUsageReset: doc.lastAiUsageReset ?? new Date(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPersistence(
    entity: Partial<SubscriptionEntity>,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (entity.plan !== undefined) data['plan'] = entity.plan;
    if (entity.status !== undefined) data['status'] = entity.status;

    // ─── Stripe fields ───────────────────────────────────────────────────────
    // Convert undefined → null for MongoDB storage
    if (entity.stripeCustomerId !== undefined)
      data['stripeCustomerId'] = entity.stripeCustomerId ?? null;
    if (entity.stripeSubscriptionId !== undefined)
      data['stripeSubscriptionId'] = entity.stripeSubscriptionId ?? null;

    // ─── Billing period ──────────────────────────────────────────────────────
    if (entity.currentPeriodStart !== undefined)
      data['currentPeriodStart'] = entity.currentPeriodStart;
    if (entity.currentPeriodEnd !== undefined)
      data['currentPeriodEnd'] = entity.currentPeriodEnd;

    // ─── Cancellation ────────────────────────────────────────────────────────
    if (entity.cancelledAt !== undefined)
      data['cancelledAt'] = entity.cancelledAt ?? null;

    if (entity.aiUsageCount !== undefined)
      data['aiUsageCount'] = entity.aiUsageCount;
    if (entity.lastAiUsageReset !== undefined)
      data['lastAiUsageReset'] = entity.lastAiUsageReset;

    return data;
  }
}