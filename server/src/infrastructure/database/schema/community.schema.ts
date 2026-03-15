import { Schema } from 'mongoose';

export const CommunityChatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// Cursor-based pagination — always sorted newest first
CommunityChatSchema.index({ createdAt: -1 });

// Monthly count per user — rolling 30-day quota check
CommunityChatSchema.index({ userId: 1, createdAt: -1 });