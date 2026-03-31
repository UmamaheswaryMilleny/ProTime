import mongoose, { Schema } from 'mongoose';

export const StudyRoomMessageSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'StudyRoom', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false, maxlength: 1000, default: '' },
    fileUrl: { type: String, required: false },
    fileType: { type: String, required: false },
  },
  { timestamps: true }
);

StudyRoomMessageSchema.index({ roomId: 1, createdAt: -1 });
