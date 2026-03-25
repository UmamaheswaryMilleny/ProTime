import { Schema, Types } from 'mongoose';
import { ScheduleConfirmStatus } from '../../../domain/enums/calendar.enums';

export const SessionScheduleRequestSchema = new Schema(
  {
    sessionId: {
      type:     Types.ObjectId,
      ref:      'BuddySession',
      required: false,
    },

    recurringDates: {
      type:     [Date],
      default:  [],
    },

    durationMinutes: {
      type:     Number,
      default:  0,
    },

    proposedBy: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    proposedTo: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    scheduledAt: {
      type:     Date,
      required: true,
    },

    confirmStatus: {
      type:     String,
      enum:     Object.values(ScheduleConfirmStatus),
      required: true,
      default:  ScheduleConfirmStatus.PENDING,
    },

    expiresAt: {
      type:     Date,
      required: true,
    },

    respondedAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// Pending requests for a user — notification badge query
SessionScheduleRequestSchema.index({ proposedTo: 1, confirmStatus: 1 });

// Expired requests — cron job query
SessionScheduleRequestSchema.index({ confirmStatus: 1, expiresAt: 1 });

// Check if request already exists for a session
SessionScheduleRequestSchema.index({ sessionId: 1 });
