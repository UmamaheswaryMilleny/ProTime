import { Schema } from 'mongoose';

export const ChatSessionSchema = new Schema(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        startedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        durationMinutes: {
            type: Number,
            enum: [25, 45, 60, 120],
            required: true,
        },

        startedAt: {
            type: Date,
            required: true,
        },

        // null = session still active — derive isActive from this
        endedAt: {
            type: Date,
            default: null,
        },

        pausedAt: {
            type: Date,
            default: null,
        },

        pomodorosCompleted: {
            type: Number,
            default: 0,
        },

        controlledBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true },
);

// Find active session — endedAt: null means still running
ChatSessionSchema.index({ conversationId: 1, endedAt: 1 });