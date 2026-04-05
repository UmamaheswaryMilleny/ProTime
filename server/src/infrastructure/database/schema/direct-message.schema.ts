import { Schema } from 'mongoose';
import { MessageType, MessageStatus } from '../../../domain/enums/chat.enums';

export const DirectMessageSchema = new Schema(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        // null for SYSTEM messages
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        content: {
            type: String,
            maxlength: 1000,
            default: '',
        },

        messageType: {
            type: String,
            enum: Object.values(MessageType),
            required: true,
            default: MessageType.TEXT,
        },

        status: {
            type: String,
            enum: Object.values(MessageStatus),
            required: true,
            default: MessageStatus.SENT,
        },

        readAt: {
            type: Date,
            default: null,
        },

        // Tags message to a shared pomodoro session
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'ChatSession',
            default: null,
        },
        fileUrl:  { type: String, default: null },
        fileName: { type: String, default: null },
        fileSize: { type: Number, default: null },
        fileType: { type: String, default: null },
    },
    { timestamps: true },
);

// Primary query — load messages for a conversation, cursor-based
DirectMessageSchema.index({ conversationId: 1, createdAt: -1 });

// countUnread — messages not read by receiver
DirectMessageSchema.index({ conversationId: 1, senderId: 1, status: 1 });

// markAllAsRead — bulk update
DirectMessageSchema.index({ conversationId: 1, status: 1 });