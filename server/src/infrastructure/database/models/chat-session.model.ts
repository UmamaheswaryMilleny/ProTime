import mongoose, { Document, Model } from 'mongoose';
import { ChatSessionSchema } from '../schema/chat-session.schema';

export interface ChatSessionDocument extends Document {
    conversationId: mongoose.Types.ObjectId;
    startedBy: mongoose.Types.ObjectId;
    durationMinutes: number;
    startedAt: Date;
    endedAt: Date | null;
    pausedAt: Date | null;
    pomodorosCompleted: number;
    controlledBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export const ChatSessionModel: Model<ChatSessionDocument> =
    mongoose.models.ChatSession ||
    mongoose.model<ChatSessionDocument>('ChatSession', ChatSessionSchema);