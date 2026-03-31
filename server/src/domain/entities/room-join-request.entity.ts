import { JoinRequestStatus } from "../enums/study-room.enums";

export interface RoomJoinRequestEntity {
  id?: string;
  roomId: string;
  userId: string;
  status: JoinRequestStatus;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
