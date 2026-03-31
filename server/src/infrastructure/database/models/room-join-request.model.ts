import mongoose, { Document, Model, Types } from 'mongoose';
import { RoomJoinRequestSchema } from '../schema/room-join-request.schema';
import { JoinRequestStatus } from '../../../domain/enums/study-room.enums';

export interface RoomJoinRequestDocument extends Document {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  status: JoinRequestStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const RoomJoinRequestModel: Model<RoomJoinRequestDocument> =
  mongoose.models.RoomJoinRequest ||
  mongoose.model<RoomJoinRequestDocument>('RoomJoinRequest', RoomJoinRequestSchema);
