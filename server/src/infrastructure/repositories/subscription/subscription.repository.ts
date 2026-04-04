import { injectable } from 'tsyringe';
import mongoose from 'mongoose';

import { BaseRepository } from '../base.repository';
import { SubscriptionModel,SubscriptionDocument } from '../../database/models/subscription.model';
import { UserModel } from '../../database/models/user.model';
import { SubscriptionInfraMapper } from '../../database/mappers/subscription.mapper';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription/subscription.repository.interface';
import type { SubscriptionEntity } from '../../../domain/entities/subscription.entity';

@injectable()
export class SubscriptionRepository
  extends BaseRepository<SubscriptionDocument, SubscriptionEntity>
  implements ISubscriptionRepository
{
  constructor() {
    super(SubscriptionModel, SubscriptionInfraMapper.toDomain);
  }

  // ─── Primary lookup ───────────────────────────────────────────────────────
  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const doc = await SubscriptionModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
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
      | 'aiUsageCount'
      | 'lastAiUsageReset'
    >>,
  ): Promise<SubscriptionEntity | null> {
    const update = SubscriptionInfraMapper.toPersistence(data);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const doc = await SubscriptionModel.findOneAndUpdate(
      { userId: userObjectId },
      { $set: update },
      { new: true, upsert: true }, // return the updated document, create if not exists
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

  // ─── Admin logic ──────────────────────────────────────────────────────────

  async countDocuments(filter: any): Promise<number> {
    return SubscriptionModel.countDocuments(filter);
  }

  // Returns paginated list of subscriptions joined with user data
  async findAllWithUser(params: {
    plan?:   string;
    status?: any;
    search?: string;
    page:    number;
    limit:   number;
  }): Promise<{
    subscriptions: any[];
    total:         number;
  }> {
    const { plan, status, search, page, limit } = params;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $match: {
          role:      'CLIENT',
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from:         'profiles',
          localField:   '_id',
          foreignField: 'userId',
          as:           'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from:         'subscriptions',
          localField:   '_id',
          foreignField: 'userId',
          as:           'subscription',
        },
      },
      { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
    ];

    // Project everything into a consistent shape, defaulting to FREE if no subscription exists
    pipeline.push({
      $project: {
        _id:                  { $ifNull: ['$subscription._id', new mongoose.Types.ObjectId()] },
        userId:               '$_id',
        plan:                 { $ifNull: ['$subscription.plan', 'FREE'] },
        status:               { $ifNull: ['$subscription.status', 'ACTIVE'] },
        stripeSubscriptionId: { $ifNull: ['$subscription.stripeSubscriptionId', null] },
        currentPeriodStart:   { $ifNull: ['$subscription.currentPeriodStart', '$createdAt'] },
        currentPeriodEnd:     { $ifNull: ['$subscription.currentPeriodEnd', '$createdAt'] },
        user: {
          id:        '$_id',
          fullName:  '$fullName',
          email:     '$email',
          username:  { $ifNull: ['$profile.username', 'N/A'] },
          createdAt: '$createdAt',
        },
      },
    });

    const match: any = {};
    if (plan && plan !== 'ALL' && plan !== 'all') {
      match.plan = plan.toUpperCase();
    }
    if (status && status !== 'all' && status !== 'ALL') {
      match.status = status.toUpperCase();
    }
    if (search) {
      match.$or = [
        { 'user.fullName': { $regex: search, $options: 'i' } },
        { 'user.email':    { $regex: search, $options: 'i' } },
      ];
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data:     [
          { $sort: { 'user.fullName': 1 } }, // Default sort by name
          { $skip: skip },
          { $limit: limit },
        ],
      },
    });

    const [result] = await UserModel.aggregate(pipeline);
    const data = result.data || [];
    const total = result.metadata[0]?.total ?? 0;

    return { subscriptions: data, total };
  }
}