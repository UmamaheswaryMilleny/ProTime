import mongoose, { Document, Model, Types } from 'mongoose';
import { StudyRoomSchema } from '../schema/study-room.schema';
import { RoomType, RoomStatus, LevelRequired, RoomFeature } from '../../../domain/enums/study-room.enums';

export interface StudyRoomDocument extends Document {
  hostId: Types.ObjectId;
  name: string;
  description: string;
  type: RoomType;
  status: RoomStatus;
  maxParticipants: number;
  tags: string[];
  levelRequired: LevelRequired;
  features: RoomFeature[];
  startTime: string;
  participantIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const StudyRoomModel: Model<StudyRoomDocument> =
  mongoose.models.StudyRoom ||
  mongoose.model<StudyRoomDocument>('StudyRoom', StudyRoomSchema);
