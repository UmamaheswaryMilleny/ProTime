import { Schema } from 'mongoose';

import { BadgeCategory, BadgeConditionType } from '../../../domain/enums/gamification.enums';

export const BadgeDefinitionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    iconUrl: {
      type: String,
      default: null, // null means no icon set yet.
    },
    category: {
      type: String,
      enum: Object.values(BadgeCategory),
      required: true,
    },
    conditionType: {
      type: String,
      enum: Object.values(BadgeConditionType),
      required: true,
    },
    conditionValue: {
      type: Number,
      required: true,
      min: 1,
    },
    xpReward: {
      type: Number,
      default: 50,
      min: 0, //Prevents negative 
    },
    premiumRequired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);


export const UserBadgeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'BadgeDefinition',
      required: true,
    },
    badgeKey: {
      type: String,
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      //he arrow function runs fresh every time a new document is created.
      default: () => new Date(),
    },
    xpAwarded: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index 
// Prevents a user from earning the same badge twice
UserBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });