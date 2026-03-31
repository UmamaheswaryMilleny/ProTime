import { inject, injectable } from "tsyringe";
import type { IGetPendingJoinRequestsUsecase } from "../../interface/study-room/get-pending-join-requests.usecase.interface";
import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import { RoomNotFoundError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";

@injectable()
export class GetPendingJoinRequestsUsecase implements IGetPendingJoinRequestsUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
  ) {}

  async execute(hostId: string, roomId: string): Promise<RoomJoinRequestResponseDTO[]> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== hostId) throw new UnauthorizedRoomActionError();

    const requests = await this.joinRequestRepo.findPendingByRoomId(roomId);

    const mappedRequests: RoomJoinRequestResponseDTO[] = await Promise.all(
      requests.map(async (req) => {
        const user = await this.userRepo.findById(req.userId);
        return {
          id: req.id!,
          roomId: req.roomId,
          userId: req.userId,
          userName: user?.fullName || 'Unknown',
          status: req.status,
          createdAt: req.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: req.updatedAt?.toISOString() || new Date().toISOString()
        };
      })
    );

    return mappedRequests;
  }
}
