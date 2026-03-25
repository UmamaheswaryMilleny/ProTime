import mongoose, { Document, Model } from 'mongoose';
import { BuddySessionSchema } from '../schema/buddy-session.schema';
import type { SessionStatus } from '../../../domain/enums/calendar.enums';

export interface BuddySessionDocument extends Document {
  conversationId:    mongoose.Types.ObjectId;
  buddyConnectionId: mongoose.Types.ObjectId;
  initiatorId:       mongoose.Types.ObjectId;
  participantId:     mongoose.Types.ObjectId;
  status:            SessionStatus;
  scheduledAt:       Date | null;
  startedAt:         Date | null;
  endedAt:           Date | null;
  roomId:            string;
  createdAt:         Date;
  updatedAt:         Date;
}

export const BuddySessionModel: Model<BuddySessionDocument> =
  mongoose.models.BuddySession ||
  mongoose.model<BuddySessionDocument>('BuddySession', BuddySessionSchema);
