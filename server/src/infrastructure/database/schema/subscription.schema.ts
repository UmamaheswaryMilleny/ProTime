import mongoose, { Schema } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../../../domain/enums/subscription.enums';

export const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one subscription document per user, always
    },

    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: true,
      default: SubscriptionPlan.FREE,
    },

    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      required: true,
      default: SubscriptionStatus.ACTIVE,
    },

    // ─── Stripe fields ──────────────────────────────────────────────────────
    // sparse: true — only indexes documents where the field exists
    // without sparse, unique would reject multiple null values
    stripeCustomerId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },

 
    currentPeriodStart: {
      type: Date,
      required: true
    },

    currentPeriodEnd: {
      type: Date,
      required: true
    },

    // ─── Cancellation ───────────────────────────────────────────────────────
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt managed by Mongoose
  },
);