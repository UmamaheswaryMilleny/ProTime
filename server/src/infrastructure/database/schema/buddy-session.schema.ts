import { Schema, Types } from 'mongoose';
import { SessionStatus } from '../../../domain/enums/calendar.enums';

export const BuddySessionSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },

    buddyConnectionId: {
      type: Types.ObjectId,
      ref: 'BuddyConnection',
      required: true,
    },

    initiatorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    participantId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(SessionStatus),
      required: true,
      // default removed — always explicitly set in usecase (ACTIVE or PLANNED)
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    roomId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Active session lookup — most common query
BuddySessionSchema.index({ conversationId: 1, status: 1 });

// All sessions for a conversation — sorted newest first
BuddySessionSchema.index({ conversationId: 1, createdAt: -1 });

// Planned sessions for a user — reminder + missed cron
BuddySessionSchema.index({ initiatorId: 1, status: 1, scheduledAt: 1 });
BuddySessionSchema.index({ participantId: 1, status: 1, scheduledAt: 1 });

// Cron job — PLANNED sessions before cutoff time
BuddySessionSchema.index({ status: 1, scheduledAt: 1 });
