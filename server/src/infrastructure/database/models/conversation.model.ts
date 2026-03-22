import mongoose, { Document, Model } from 'mongoose';
import { ConversationSchema } from '../schema/conversation.schema.ts';

export interface ConversationDocument extends Document {
    buddyConnectionId: mongoose.Types.ObjectId;
    user1Id: mongoose.Types.ObjectId;
    user2Id: mongoose.Types.ObjectId;
    lastMessageAt: Date | null;
    lastMessageBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export const ConversationModel: Model<ConversationDocument> =
    mongoose.models.Conversation ||
    mongoose.model<ConversationDocument>('Conversation', ConversationSchema);