import { inject, injectable } from "tsyringe";
import type { IInviteToRoomUsecase } from "../../interface/study-room/invite-to-room.usecase.interface";
import { RoomJoinRequestResponseDTO } from "../../../dto/study-room/request/study-room.dto";
import { JoinRequestStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import { RoomNotFoundError, RoomAlreadyJoinedError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";
import type { INotificationService } from "../../../../application/service_interface/notification-service.interface";
import { NotificationType } from "../../../../application/service_interface/notification-service.interface";

@injectable()
export class InviteToRoomUsecase implements IInviteToRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('ISocketService') private socketService: ISocketService,
    @inject('INotificationService') private notificationService: INotificationService,
  ) {}

  async execute(hostId: string, roomId: string, userIdToInvite: string): Promise<RoomJoinRequestResponseDTO> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== hostId) throw new UnauthorizedRoomActionError();

    if (room.participantIds.includes(userIdToInvite)) {
      throw new RoomAlreadyJoinedError();
    }

    const existingRequest = await this.joinRequestRepo.findExistingRequest(roomId, userIdToInvite);
    let savedRequest;

    if (existingRequest) {
      savedRequest = await this.joinRequestRepo.updateStatus(existingRequest.id!, JoinRequestStatus.INVITED, new Date());
    } else {
      savedRequest = await this.joinRequestRepo.save({
        roomId,
        userId: userIdToInvite,
        status: JoinRequestStatus.INVITED
      });
    }

    if (!savedRequest) {
      throw new Error("Failed to invite buddy to room.");
    }

    const hostUser = await this.userRepo.findById(hostId);
    const invitedUser = await this.userRepo.findById(userIdToInvite);

    // Emit socket to user if online
    this.socketService.emitToUser(userIdToInvite, 'room:invited', {
      requestId: savedRequest.id,
      roomId,
      roomName: room.name,
      hostId,
      hostName: hostUser?.fullName || 'Unknown'
    });

    // Notify user via in-app notification
    this.notificationService.notifyUser(userIdToInvite, {
      type: NotificationType.STUDY_ROOM_INVITE,
      title: 'Study Room Invitation',
      message: `${hostUser?.fullName || 'A buddy'} invited you to join the study room "${room.name}".`,
      metadata: { roomId }
    });

    return {
      id: savedRequest.id!,
      roomId: savedRequest.roomId,
      roomName: room.name,
      userId: savedRequest.userId,
      userName: invitedUser?.fullName || 'Unknown',
      status: savedRequest.status,
      isAlreadyParticipant: false,
      createdAt: savedRequest.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: savedRequest.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
