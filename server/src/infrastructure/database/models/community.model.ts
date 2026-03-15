import mongoose, { Document, Model } from 'mongoose';
import { CommunityChatSchema } from '../schema/community.schema';

export interface CommunityChatDocument extends Document {
  userId:    mongoose.Types.ObjectId;
  content:   string;
  createdAt: Date;
  updatedAt: Date;
}

export const CommunityChatModel: Model<CommunityChatDocument> =
  mongoose.models.CommunityChat ||
  mongoose.model<CommunityChatDocument>('CommunityChat', CommunityChatSchema);