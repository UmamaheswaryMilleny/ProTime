import { inject, injectable } from "tsyringe";
import type { IJoinRoomUsecase } from "../../interface/study-room/join-room.usecase.interface";
import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";
import { RoomStatus, JoinRequestStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";
import { RoomNotFoundError, RoomNotLiveError, RoomAlreadyJoinedError, RoomFullError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class JoinRoomUsecase implements IJoinRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IProfileRepository') private profileRepo: IProfileRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(userId: string, roomId: string): Promise<StudyRoomResponseDTO> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.status === RoomStatus.ENDED) throw new RoomNotLiveError();
    if (room.participantIds.includes(userId)) throw new RoomAlreadyJoinedError();
    if (room.participantIds.length >= room.maxParticipants) throw new RoomFullError();

    // For PRIVATE rooms, verify invitation or approved join request
    if (room.type === 'PRIVATE' && room.hostId !== userId) {
      const userRequest = await this.joinRequestRepo.findExistingRequest(roomId, userId);

      if (!userRequest) {
        throw new UnauthorizedRoomActionError();
      }

      const allowedStatuses: JoinRequestStatus[] = [
        JoinRequestStatus.INVITED,
        JoinRequestStatus.ACCEPTED
      ];

      if (!allowedStatuses.includes(userRequest.status)) {
        throw new UnauthorizedRoomActionError();
      }

      // If they were invited, mark as accepted now that they've joined
      if (userRequest.status === JoinRequestStatus.INVITED) {
        await this.joinRequestRepo.updateStatus(userRequest.id!, JoinRequestStatus.ACCEPTED, new Date());
      }
    }

    const updatedRoom = await this.studyRoomRepo.addParticipant(roomId, userId);
    if (!updatedRoom) throw new RoomNotFoundError();

    const hostUser = await this.userRepo.findById(updatedRoom.hostId);
    const hostProfile = await this.profileRepo.findByUserId(updatedRoom.hostId);
    const participantProfiles = await this.profileRepo.findByUserIds(updatedRoom.participantIds);

    // Provide the new participant data and emit room:user-joined
    if (typeof this.socketService.emitToRoom === 'function') {
      this.socketService.emitToRoom(roomId, 'room:user-joined', { userId, roomId });
    }

    return {
      id: updatedRoom.id!,
      hostId: updatedRoom.hostId,
      hostName: hostUser?.fullName || 'Unknown',
      hostAvatar: hostProfile?.profileImage || undefined,
      name: updatedRoom.name,
      description: updatedRoom.description,
      type: updatedRoom.type,
      status: updatedRoom.status,
      maxParticipants: updatedRoom.maxParticipants,
      currentParticipants: updatedRoom.participantIds.length,
      tags: updatedRoom.tags || [],
      levelRequired: updatedRoom.levelRequired,
      features: updatedRoom.features,
      startTime: updatedRoom.startTime || 'IMMEDIATE',
      isLive: updatedRoom.status === RoomStatus.LIVE,
      participantIds: updatedRoom.participantIds,
      participants: participantProfiles.map(p => ({
        id: p.userId,
        name: p.fullName,
        avatar: p.profileImage || undefined
      })),
      createdAt: updatedRoom.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedRoom.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
