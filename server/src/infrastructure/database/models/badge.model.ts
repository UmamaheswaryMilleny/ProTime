import mongoose, { Document, Model } from 'mongoose';
import { BadgeDefinitionSchema, UserBadgeSchema } from '../schema/badge.schema';
import { BadgeCategory, BadgeConditionType } from '../../../domain/enums/gamification.enums'


export interface BadgeDefinitionDocument extends Document {
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  category: BadgeCategory;
  conditionType: BadgeConditionType;
  conditionValue: number;
  xpReward: number;
  premiumRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const BadgeDefinitionModel: Model<BadgeDefinitionDocument> =
  mongoose.models.BadgeDefinition ||
  mongoose.model<BadgeDefinitionDocument>('BadgeDefinition', BadgeDefinitionSchema);


export interface UserBadgeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  badgeDefinitionId: mongoose.Types.ObjectId;
  badgeKey: string;
  earnedAt: Date;
  xpAwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserBadgeModel: Model<UserBadgeDocument> =
  mongoose.models.UserBadge ||
  mongoose.model<UserBadgeDocument>('UserBadge', UserBadgeSchema);