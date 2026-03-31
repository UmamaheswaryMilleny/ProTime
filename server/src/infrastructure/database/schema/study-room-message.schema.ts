import mongoose, { Schema } from 'mongoose';

export const StudyRoomMessageSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'StudyRoom', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

StudyRoomMessageSchema.index({ roomId: 1, createdAt: -1 });
