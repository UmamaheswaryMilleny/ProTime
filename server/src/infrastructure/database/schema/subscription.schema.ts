import { Schema } from 'mongoose';
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



    // without sparse, unique would reject multiple null values
    stripeCustomerId: {
      type: String,
      sparse: true,
      unique: true,
    },

    stripeSubscriptionId: {
      type: String,
      sparse: true,
      unique: true,
    },


    currentPeriodStart: {
      type: Date,
      required: true,
      default: () => new Date(),
    },

    currentPeriodEnd: {
      type: Date,
      required: true,
      default: () => new Date(),
    },


    cancelledAt: {
      type: Date,
      default: null,
    },

    aiUsageCount: {
      type: Number,
      required: true,
      default: 0,
    },

    lastAiUsageReset: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);