import { inject, injectable } from "tsyringe";
import type { IRequestToJoinUsecase } from "../../interface/study-room/request-to-join.usecase.interface";
import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";
import { JoinRequestStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import { RoomNotFoundError, RoomAlreadyJoinedError, AlreadyRequestedError } from "../../../../domain/errors/study-room.errors";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class RequestToJoinUsecase implements IRequestToJoinUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(userId: string, roomId: string): Promise<RoomJoinRequestResponseDTO> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.participantIds.includes(userId)) throw new RoomAlreadyJoinedError();

    const existingRequest = await this.joinRequestRepo.findExistingRequest(roomId, userId);
    if (existingRequest && existingRequest.status === JoinRequestStatus.PENDING) {
      throw new AlreadyRequestedError();
    }

    const savedRequest = await this.joinRequestRepo.save({
      roomId,
      userId,
      status: JoinRequestStatus.PENDING
    });

    const user = await this.userRepo.findById(userId);

    this.socketService.emitToUser(room.hostId, 'room:join-request', {
      requestId: savedRequest.id,
      roomId,
      userId,
      userName: user?.fullName || 'Unknown'
    });

    return {
      id: savedRequest.id!,
      roomId: savedRequest.roomId,
      userId: savedRequest.userId,
      userName: user?.fullName || 'Unknown',
      status: savedRequest.status,
      createdAt: savedRequest.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: savedRequest.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
