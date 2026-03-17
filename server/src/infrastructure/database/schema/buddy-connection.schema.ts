import { Schema } from 'mongoose';
import { BuddyConnectionStatus } from '../../../domain/enums/buddy.enums';

export const BuddyConnectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    buddyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(BuddyConnectionStatus),
      required: true,
      default: BuddyConnectionStatus.PENDING,
    },

    // Set when receiver accepts — this is when quota is consumed
    addedAt: {
      type: Date,
      default: null,
    },

    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 1–5 stars given after session — null until first session rated
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    totalSessionsCompleted: {
      type: Number,
      default: 0,
    },

    totalSessionMinutes: {
      type: Number,
      default: 0,
    },

    lastSessionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes 

// Prevent duplicate connection between same two users
BuddyConnectionSchema.index({ userId: 1, buddyId: 1 }, { unique: true });

// findByUserId — queries both userId and buddyId
BuddyConnectionSchema.index({ userId: 1 });

// countAcceptedThisMonth — filters by status + addedAt on both sides
BuddyConnectionSchema.index({ userId: 1, status: 1, addedAt: 1 });
BuddyConnectionSchema.index({ buddyId: 1, status: 1, addedAt: 1 });

// findPendingByReceiverId
BuddyConnectionSchema.index({ buddyId: 1, status: 1 });