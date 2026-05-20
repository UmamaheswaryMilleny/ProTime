import { inject, injectable } from "tsyringe";
import type { IStartRoomUsecase } from "../../interface/study-room/start-room.usecase.interface";
import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";
import { RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";
import { RoomNotFoundError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";
import type { INotificationService } from "../../../service_interface/notification-service.interface";
import { NotificationType } from "../../../service_interface/notification-service.interface";

@injectable()
export class StartRoomUsecase implements IStartRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IProfileRepository') private profileRepo: IProfileRepository,
    @inject('INotificationService') private notificationService: INotificationService,
  ) {}

  async execute(hostId: string, roomId: string): Promise<StudyRoomResponseDTO> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== hostId) {
      throw new UnauthorizedRoomActionError();
    }

    if (room.status === RoomStatus.LIVE) {
      return this.mapToDTO(room);
    }

    const updatedRoom = await this.studyRoomRepo.updateStatus(roomId, RoomStatus.LIVE);
    if (!updatedRoom) throw new RoomNotFoundError();

    // Notify all participants (except the host)
    const hostUser = await this.userRepo.findById(hostId);
    const participantsToNotify = updatedRoom.participantIds.filter(id => id !== hostId);

    for (const participantId of participantsToNotify) {
      this.notificationService.notifyUser(participantId, {
        type: NotificationType.STUDY_ROOM_START,
        title: 'Study Session Started!',
        message: `The study room "${updatedRoom.name}" has started. Join now!`,
        metadata: {
          roomId: updatedRoom.id,
          roomName: updatedRoom.name,
          hostName: hostUser?.fullName || 'Host'
        }
      });
    }

    return this.mapToDTO(updatedRoom);
  }

  private async mapToDTO(room: any): Promise<StudyRoomResponseDTO> {
    const hostUser = await this.userRepo.findById(room.hostId);
    const hostProfile = await this.profileRepo.findByUserId(room.hostId);
    const participantProfiles = await this.profileRepo.findByUserIds(room.participantIds);

    return {
      id: room.id!,
      hostId: room.hostId,
      hostName: hostUser?.fullName || 'Unknown',
      hostAvatar: hostProfile?.profileImage || undefined,
      name: room.name,
      description: room.description,
      type: room.type,
      status: room.status,
      maxParticipants: room.maxParticipants,
      currentParticipants: room.participantIds.length,
      tags: room.tags || [],
      levelRequired: room.levelRequired,
      features: room.features,
      startTime: room.startTime || 'IMMEDIATE',
      isLive: true,
      participantIds: room.participantIds,
      participants: participantProfiles.map(p => ({
        id: p.userId,
        name: p.fullName,
        avatar: p.profileImage || undefined
      })),
      createdAt: room.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: room.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
