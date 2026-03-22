import mongoose, { Document, Model } from 'mongoose';
import { DirectMessageSchema } from '../schema/direct-message.schema';
import type { MessageType, MessageStatus } from '../../../domain/enums/chat.enums';

export interface DirectMessageDocument extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId | null;
    content: string;
    messageType: MessageType;
    status: MessageStatus;
    readAt: Date | null;
    sessionId: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export const DirectMessageModel: Model<DirectMessageDocument> =
    mongoose.models.DirectMessage ||
    mongoose.model<DirectMessageDocument>('DirectMessage', DirectMessageSchema);