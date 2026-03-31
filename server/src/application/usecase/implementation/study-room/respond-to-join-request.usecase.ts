import { inject, injectable } from "tsyringe";
import type { IRespondToJoinRequestUsecase } from "../../interface/study-room/respond-to-join-request.usecase.interface";
import { RespondToJoinRequestDTO, RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";
import { JoinRequestStatus, RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import { JoinRequestNotFoundError, UnauthorizedRoomActionError, JoinRequestAlreadyRespondedError, RoomNotFoundError, RoomFullError } from "../../../../domain/errors/study-room.errors";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class RespondToJoinRequestUsecase implements IRespondToJoinRequestUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(hostId: string, requestId: string, dto: RespondToJoinRequestDTO): Promise<RoomJoinRequestResponseDTO> {
    const request = await this.joinRequestRepo.findById(requestId);
    if (!request) throw new JoinRequestNotFoundError();

    const room = await this.studyRoomRepo.findById(request.roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== hostId) throw new UnauthorizedRoomActionError();

    if (request.status !== JoinRequestStatus.PENDING) {
      throw new JoinRequestAlreadyRespondedError();
    }

    const newStatus = dto.action === 'APPROVE' ? JoinRequestStatus.APPROVED : JoinRequestStatus.REJECTED;
    const respondedAt = new Date();

    if (newStatus === JoinRequestStatus.APPROVED) {
      if (room.participantIds.length >= room.maxParticipants) throw new RoomFullError();
      await this.studyRoomRepo.addParticipant(request.roomId, request.userId);
      this.socketService.emitToUser(request.userId, 'room:request-approved', { roomId: request.roomId });
      if (typeof this.socketService.emitToRoom === 'function') {
        this.socketService.emitToRoom(request.roomId, 'room:user-joined', { userId: request.userId, roomId: request.roomId });
      }
    } else {
      this.socketService.emitToUser(request.userId, 'room:request-rejected', { roomId: request.roomId });
    }

    const updatedRequest = await this.joinRequestRepo.updateStatus(requestId, newStatus, respondedAt);

    const user = await this.userRepo.findById(request.userId);

    return {
      id: updatedRequest!.id!,
      roomId: updatedRequest!.roomId,
      userId: updatedRequest!.userId,
      userName: user?.fullName || 'Unknown',
      status: updatedRequest!.status,
      respondedAt: updatedRequest!.respondedAt?.toISOString(),
      createdAt: updatedRequest!.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedRequest!.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
