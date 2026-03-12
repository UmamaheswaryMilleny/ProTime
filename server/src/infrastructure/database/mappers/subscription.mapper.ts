import type { SubscriptionDocument } from '../models/subscription.model';
import type { SubscriptionEntity } from '../../../domain/entities/subscription.entity';

export class SubscriptionInfraMapper {

  static toDomain(doc: SubscriptionDocument): SubscriptionEntity {
    return {
      id: (doc._id as object).toString(),
      userId: doc.userId.toString(),
      plan: doc.plan,
      status: doc.status,

      // ─── Stripe fields ────────────────────────────────────────────────────
      // Convert null → undefined to match domain entity optional fields
      stripeCustomerId: doc.stripeCustomerId ?? undefined,
      stripeSubscriptionId: doc.stripeSubscriptionId ?? undefined,

      // ─── Billing period ───────────────────────────────────────────────────
      // Null is valid for FREE users — preserved as-is
      currentPeriodStart: doc.currentPeriodStart,
      currentPeriodEnd: doc.currentPeriodEnd,

      // ─── Cancellation ─────────────────────────────────────────────────────
      cancelledAt: doc.cancelledAt ?? undefined,

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

    return data;
  }
}