import { Schema } from 'mongoose';
import { JoinRequestStatus } from '../../../domain/enums/study-room.enums';

export const RoomJoinRequestSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'StudyRoom', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(JoinRequestStatus), default: JoinRequestStatus.PENDING },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

RoomJoinRequestSchema.index({ roomId: 1, status: 1 });
RoomJoinRequestSchema.index({ userId: 1, status: 1 });
RoomJoinRequestSchema.index({ roomId: 1, userId: 1 }, { unique: true });
