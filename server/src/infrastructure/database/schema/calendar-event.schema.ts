import { Schema, Types } from 'mongoose';
import { CalendarEventType } from '../../../domain/enums/calendar.enums';

export const CalendarEventSchema = new Schema(
  {
    userId: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    type: {
      type:     String,
      enum:     Object.values(CalendarEventType),
      required: true,
    },

    // YYYY-MM-DD string — fast calendar range queries
    date: {
      type:     String,
      required: true,
    },

    title: {
      type:     String,
      required: true,
      maxlength: 200,
    },

    startTime: {
      type:    String,   // HH:MM display only
      default: null,
    },

    sessionId: {
      type:    Types.ObjectId,
      ref:     'BuddySession',
      default: null,
    },

    todoId: {
      type:    Types.ObjectId,
      ref:     'Todo',
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// Primary query — calendar range by user
CalendarEventSchema.index({ userId: 1, date: 1 });

// Session event lookup
CalendarEventSchema.index({ sessionId: 1 });

// Todo event lookup
CalendarEventSchema.index({ todoId: 1, userId: 1 });
