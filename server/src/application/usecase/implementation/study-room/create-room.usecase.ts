import { inject, injectable } from "tsyringe";
import type { ICreateRoomUsecase } from "../../interface/study-room/create-room.usecase.interface";
import { CreateRoomRequestDTO, StudyRoomResponseDTO } from "../../../dtos/study-room.dto";
import { RoomStatus, RoomType, LevelRequired } from "../../../../domain/enums/study-room.enums";
import { StudyRoomEntity } from "../../../../domain/entities/study-room.entity";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { INotificationService } from "../../../service_interface/notification-service.interface";
import { NotificationType } from "../../../service_interface/notification-service.interface";
import { JoinRequestStatus } from "../../../../domain/enums/study-room.enums";

@injectable()
export class CreateRoomUsecase implements ICreateRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('INotificationService') private notificationService: INotificationService,
  ) {}

  async execute(hostId: string, dto: CreateRoomRequestDTO): Promise<StudyRoomResponseDTO> {
    const roomEntity: Partial<StudyRoomEntity> = {
      hostId,
      name: dto.name,
      description: dto.description,
      type: dto.type || RoomType.PUBLIC,
      status: RoomStatus.WAITING,
      maxParticipants: dto.maxParticipants,
      tags: dto.tags || [],
      levelRequired: dto.levelRequired || LevelRequired.ANY,
      features: dto.features || [],
      startTime: dto.startTime || 'IMMEDIATE',
      participantIds: [hostId] // Host is automatically joined
    };

    const savedRoom = await this.studyRoomRepo.save(roomEntity);
    const hostUser = await this.userRepo.findById(hostId);

    // Send notifications to invited buddies and create persistent invitation records
    if (dto.invitedUserIds && dto.invitedUserIds.length > 0) {
      for (const invitedId of dto.invitedUserIds) {
        // Create persistent invitation record
        await this.joinRequestRepo.save({
          roomId: savedRoom.id!,
          userId: invitedId,
          status: JoinRequestStatus.INVITED,
          createdAt: new Date()
        });

        // Send real-time notification
        this.notificationService.notifyUser(invitedId, {
          type: NotificationType.STUDY_ROOM_INVITE,
          title: 'Study Room Invitation',
          message: `${hostUser?.fullName || 'Someone'} invited you to join a study room: ${savedRoom.name}`,
          metadata: {
            roomId: savedRoom.id,
            hostId: hostId,
            roomName: savedRoom.name
          }
        });
      }
    }

    return {
      id: savedRoom.id!,
      hostId: savedRoom.hostId,
      hostName: hostUser?.fullName || 'Unknown',
      name: savedRoom.name,
      description: savedRoom.description,
      type: savedRoom.type,
      status: savedRoom.status,
      maxParticipants: savedRoom.maxParticipants,
      currentParticipants: savedRoom.participantIds.length,
      tags: savedRoom.tags || [],
      levelRequired: savedRoom.levelRequired,
      features: savedRoom.features,
      startTime: savedRoom.startTime || 'IMMEDIATE',
      isLive: savedRoom.status === RoomStatus.LIVE,
      participantIds: savedRoom.participantIds,
      createdAt: savedRoom.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: savedRoom.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
