import mongoose, { Document, Model } from 'mongoose';
import { SubscriptionSchema } from '../schema/subscription.schema';
import type { SubscriptionPlan,SubscriptionStatus } from '../../../domain/enums/subscription.enums';

export interface SubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionModel: Model<SubscriptionDocument> = mongoose.model<SubscriptionDocument>(
  'Subscription',
  SubscriptionSchema,
);