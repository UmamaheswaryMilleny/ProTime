import { IBaseRepository } from "../base/base.repository.interface";
import { RoomJoinRequestEntity } from "../../entities/room-join-request.entity";
import { JoinRequestStatus } from "../../enums/study-room.enums";

export interface IRoomJoinRequestRepository extends IBaseRepository<RoomJoinRequestEntity> {
  findByRoomId(roomId: string): Promise<RoomJoinRequestEntity[]>;
  findPendingByUserId(userId: string): Promise<RoomJoinRequestEntity[]>;
  findPendingByRoomId(roomId: string): Promise<RoomJoinRequestEntity[]>;
  findPendingByRoomIds(roomIds: string[]): Promise<RoomJoinRequestEntity[]>;
  findInvitationsByUserId(userId: string): Promise<RoomJoinRequestEntity[]>;
  findExistingRequest(roomId: string, userId: string): Promise<RoomJoinRequestEntity | null>;
  updateStatus(id: string, status: JoinRequestStatus, respondedAt: Date): Promise<RoomJoinRequestEntity | null>;
}
