import mongoose, { Document, Model } from 'mongoose';
import { SessionScheduleRequestSchema } from '../schema/session-shedule-request.schema';
import type { ScheduleConfirmStatus } from '../../../domain/enums/calendar.enums';

export interface SessionScheduleRequestDocument extends Document {
  sessionId?:    mongoose.Types.ObjectId;
  proposedBy:    mongoose.Types.ObjectId;
  proposedTo:    mongoose.Types.ObjectId;
  scheduledAt:   Date;
  recurringDates: Date[];
  durationMinutes: number;
  confirmStatus: ScheduleConfirmStatus;
  expiresAt:     Date;
  respondedAt:   Date | null;
  createdAt:     Date;
  updatedAt:     Date;
}

export const SessionScheduleRequestModel: Model<SessionScheduleRequestDocument> =
  mongoose.models.SessionScheduleRequest ||
  mongoose.model<SessionScheduleRequestDocument>(
    'SessionScheduleRequest',
    SessionScheduleRequestSchema,
  );
