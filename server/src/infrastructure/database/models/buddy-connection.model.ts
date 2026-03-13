import mongoose, { Document, Model } from 'mongoose';
import { BuddyConnectionSchema } from '../schema/buddy-connection.schema';
import type { BuddyConnectionStatus } from '../../../domain/enums/buddy.enums';

export interface BuddyConnectionDocument extends Document {
  userId:                 mongoose.Types.ObjectId;
  buddyId:                mongoose.Types.ObjectId;
  status:                 BuddyConnectionStatus;
  addedAt:                Date | null;
  rating:                 number | null;
  totalSessionsCompleted: number;
  totalSessionMinutes:    number;
  lastSessionAt:          Date | null;
  createdAt:              Date;
  updatedAt:              Date;
}

export const BuddyConnectionModel: Model<BuddyConnectionDocument> =
  mongoose.models.BuddyConnection ||
  mongoose.model<BuddyConnectionDocument>('BuddyConnection', BuddyConnectionSchema);