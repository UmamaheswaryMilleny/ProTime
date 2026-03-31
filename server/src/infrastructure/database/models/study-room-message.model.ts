import mongoose, { Document, Model, Types } from 'mongoose';
import { StudyRoomMessageSchema } from '../schema/study-room-message.schema';

export interface StudyRoomMessageDocument extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const StudyRoomMessageModel: Model<StudyRoomMessageDocument> =
  mongoose.models.StudyRoomMessage ||
  mongoose.model<StudyRoomMessageDocument>('StudyRoomMessage', StudyRoomMessageSchema);
