import { RoomType, RoomStatus, RoomFeature, LevelRequired, JoinRequestStatus } from "../../domain/enums/study-room.enums";
import { IsString, IsEnum, IsNumber, IsOptional, MaxLength, Min, Max, IsArray, IsIn } from "class-validator";

export class CreateRoomRequestDTO {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsEnum(RoomType)
  type!: RoomType;

  @IsNumber()
  @Min(3)
  @Max(50)
  maxParticipants!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invitedUserIds?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsEnum(LevelRequired)
  levelRequired!: LevelRequired;

  @IsOptional()
  @IsArray()
  features?: RoomFeature[];

  @IsOptional()
  @IsString()
  startTime?: string;
}

export class GetRoomsRequestDTO {
  type?: RoomType;
  status?: RoomStatus;
  search?: string;
  page: number = 1;
  limit: number = 20;
}

export class RespondToJoinRequestDTO {
  @IsIn(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';
}

export interface StudyRoomResponseDTO {
  id: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  name: string;
  description: string;
  type: RoomType;
  status: RoomStatus;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  levelRequired: LevelRequired;
  features: RoomFeature[];
  startTime: string;
  isLive: boolean;
  participantIds: string[];
  participants?: { id: string; name: string; avatar?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomJoinRequestResponseDTO {
  id: string;
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  status: JoinRequestStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRoomsResponseDTO {
  rooms: StudyRoomResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export class SendStudyRoomMessageDTO {
  @IsString()
  @MaxLength(1000)
  content!: string;
}

export interface StudyRoomMessageResponseDTO {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

