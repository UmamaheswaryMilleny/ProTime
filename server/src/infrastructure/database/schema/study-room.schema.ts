import { Schema } from 'mongoose';
import { RoomStatus, RoomType, LevelRequired, RoomFeature } from '../../../domain/enums/study-room.enums';

export const StudyRoomSchema = new Schema(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: Object.values(RoomType), required: true },
    status: { type: String, enum: Object.values(RoomStatus), default: RoomStatus.WAITING },
    maxParticipants: { type: Number, required: true, min: 2, max: 50 },
    tags: { type: [String], default: [] },
    levelRequired: { type: String, enum: Object.values(LevelRequired), default: LevelRequired.ANY },
    features: { type: [String], enum: Object.values(RoomFeature), default: [] },
    startTime: { type: String, default: 'IMMEDIATE' },
    endTime: { type: String },
    participantIds: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true }
);

StudyRoomSchema.index({ status: 1, type: 1, createdAt: -1 });
StudyRoomSchema.index({ hostId: 1 });
StudyRoomSchema.index({ status: 1 });
