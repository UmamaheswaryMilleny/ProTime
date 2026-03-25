import mongoose, { Document, Model } from 'mongoose';
import { CalendarEventSchema } from '../schema/calendar-event.schema';
import type { CalendarEventType } from '../../../domain/enums/calendar.enums';

export interface CalendarEventDocument extends Document {
  userId:     mongoose.Types.ObjectId;
  type:       CalendarEventType;
  date:       string;
  title:      string;
  startTime:  string | null;
  sessionId:  mongoose.Types.ObjectId | null;
  todoId:     mongoose.Types.ObjectId | null;
  createdAt:  Date;
  updatedAt:  Date;
}

export const CalendarEventModel: Model<CalendarEventDocument> =
  mongoose.models.CalendarEvent ||
  mongoose.model<CalendarEventDocument>('CalendarEvent', CalendarEventSchema);
