import { RoomType, RoomStatus, RoomFeature, LevelRequired } from "../enums/study-room.enums";

export interface StudyRoomEntity {
  id?: string;
  hostId: string;
  name: string;
  description: string;
  type: RoomType;
  status: RoomStatus;
  maxParticipants: number;
  currentParticipants?: number;
  tags?: string[];
  levelRequired: LevelRequired;
  features: RoomFeature[];
  startTime?: string;
  endTime?: string;
  participantIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
