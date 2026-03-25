import { Schema, Types } from 'mongoose';

export const SessionNoteSchema = new Schema(
  {
    sessionId: {
      type:     Types.ObjectId,
      ref:      'BuddySession',
      required: true,
    },

    userId: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    content: {
      type:      String,
      required:  true,
      maxlength: 5000,
    },
  },
  { timestamps: true, versionKey: false },
);

// One note per user per session — enforced by unique compound index
SessionNoteSchema.index({ sessionId: 1, userId: 1 }, { unique: true });
