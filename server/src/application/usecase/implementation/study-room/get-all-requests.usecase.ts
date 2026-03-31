import { inject, injectable } from "tsyringe";
import type { IGetAllRoomRequestsUsecase } from "../../interface/study-room/get-all-requests.usecase.interface";
import { RoomJoinRequestResponseDTO } from "../../../dtos/study-room.dto";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IRoomJoinRequestRepository } from "../../../../domain/repositories/study-room/room-join-request.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";

@injectable()
export class GetAllRoomRequestsUsecase implements IGetAllRoomRequestsUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IRoomJoinRequestRepository') private joinRequestRepo: IRoomJoinRequestRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<{
    invitations: RoomJoinRequestResponseDTO[];
    joinRequests: RoomJoinRequestResponseDTO[];
  }> {
    // 1. Fetch invitations received by user
    const invitations = await this.joinRequestRepo.findInvitationsByUserId(userId);
    
    // 2. Fetch join requests for rooms owned by user
    const myRooms = await this.studyRoomRepo.findByHostId(userId);
    const myRoomIds = myRooms.map(r => r.id!);
    
    let joinRequests: any[] = [];
    if (myRoomIds.length > 0) {
      joinRequests = await this.joinRequestRepo.findPendingByRoomIds(myRoomIds);
    }

    // Map to DTOs
    const mapToDTO = async (req: any) => {
      const user = await this.userRepo.findById(req.userId);
      const room = await this.studyRoomRepo.findById(req.roomId);
      return {
        id: req.id!,
        roomId: req.roomId,
        roomName: room?.name || 'Unknown Room',
        userId: req.userId,
        userName: user?.fullName || 'Unknown User',
        status: req.status,
        isAlreadyParticipant: room?.participantIds.includes(req.userId) || room?.hostId === req.userId || false,
        createdAt: req.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: req.updatedAt?.toISOString() || new Date().toISOString()
      };
    };

    const invitationDTOs = await Promise.all(invitations.map(mapToDTO));
    const joinRequestDTOs = await Promise.all(joinRequests.map(mapToDTO));

    return {
      invitations: invitationDTOs,
      joinRequests: joinRequestDTOs
    };
  }
}
