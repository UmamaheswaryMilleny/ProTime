import { Schema } from 'mongoose';

export const ConversationSchema = new Schema(
  {
    buddyConnectionId: {
      type: Schema.Types.ObjectId,
      ref: 'BuddyConnection',
      required: true,
      unique: true, // one conversation per buddy connection
    },

    // Always store user1Id as lexicographically smaller userId
    // Prevents duplicate conversations between same two users
    user1Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    user2Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Last message preview — for sorting and display
    lastMessageAt: {
      type: Date,
      default: null,
    },

    lastMessageBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

// Chat list sorted by most recent message
ConversationSchema.index({ user1Id: 1, lastMessageAt: -1 });
ConversationSchema.index({ user2Id: 1, lastMessageAt: -1 });

// Lookup by buddyConnectionId — auto-create duplicate check
// ConversationSchema.index({ buddyConnectionId: 1 });