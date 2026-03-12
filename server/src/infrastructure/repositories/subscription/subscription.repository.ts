import { injectable } from 'tsyringe';

import { BaseRepository } from '../base.repository';
import { SubscriptionModel, SubscriptionDocument } from '../../database/models/subscription.model';
import { SubscriptionInfraMapper } from '../../database/mappers/subscription.mapper';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription/subscription.repository.interface';
import type { SubscriptionEntity } from '../../../domain/entities/subscription.entity';

@injectable()
export class SubscriptionRepository
  extends BaseRepository<SubscriptionDocument, SubscriptionEntity>
  implements ISubscriptionRepository {
  constructor() {
    super(SubscriptionModel, SubscriptionInfraMapper.toDomain);
  }

  // ─── Primary lookup ───────────────────────────────────────────────────────
  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const doc = await SubscriptionModel.findOne({ userId }).lean();
    if (!doc) return null;
    return SubscriptionInfraMapper.toDomain(doc as SubscriptionDocument);
  }

  // ─── Stripe lookups ───────────────────────────────────────────────────────
  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<SubscriptionEntity | null> {
    const doc = await SubscriptionModel.findOne({ stripeCustomerId }).lean();
    if (!doc) return null;
    return SubscriptionInfraMapper.toDomain(doc as SubscriptionDocument);
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const doc = await SubscriptionModel.findOne({ stripeSubscriptionId }).lean();
    if (!doc) return null;
    return SubscriptionInfraMapper.toDomain(doc as SubscriptionDocument);
  }

  // ─── Partial update ───────────────────────────────────────────────────────
  // Only fields explicitly provided in data are written — others untouched
  async updateByUserId(
    userId: string,
    data: Partial<Pick<SubscriptionEntity,
      | 'plan'
      | 'status'
      | 'stripeCustomerId'
      | 'stripeSubscriptionId'
      | 'currentPeriodStart'
      | 'currentPeriodEnd'
      | 'cancelledAt'
    >>,
  ): Promise<SubscriptionEntity | null> {
    const update = SubscriptionInfraMapper.toPersistence(data as any);

    const doc = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { $set: update },
      { new: true }, // return the updated document
    ).lean();

    if (!doc) return null;
    return SubscriptionInfraMapper.toDomain(doc as SubscriptionDocument);
  }

  // ─── Expiry batch job ─────────────────────────────────────────────────────
  // Finds all subscriptions where period has ended but status not yet EXPIRED
  // Called by cron job to batch-downgrade lapsed subscriptions to FREE
  async findExpiredSubscriptions(): Promise<SubscriptionEntity[]> {
    const now = new Date();

    const docs = await SubscriptionModel.find({
      currentPeriodEnd: { $lt: now },
      status: { $in: ['ACTIVE', 'CANCELLED'] },
      plan: 'PREMIUM',
    }).lean();

    return docs.map((doc) =>
      SubscriptionInfraMapper.toDomain(doc as SubscriptionDocument),
    );
  }
}