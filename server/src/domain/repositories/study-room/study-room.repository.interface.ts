import { IBaseRepository } from "../base/base.repository.interface";
import { StudyRoomEntity } from "../../entities/study-room.entity";
import { RoomStatus, RoomType } from "../../enums/study-room.enums";

export interface IStudyRoomRepository extends IBaseRepository<StudyRoomEntity> {
  findAll(params: { type?: RoomType, status?: RoomStatus, search?: string, page: number, limit: number }): Promise<{ rooms: StudyRoomEntity[], total: number }>;
  findByHostId(hostId: string): Promise<StudyRoomEntity[]>;
  findLiveRooms(page: number, limit: number): Promise<{ rooms: StudyRoomEntity[], total: number }>;
  addParticipant(roomId: string, userId: string): Promise<StudyRoomEntity | null>;
  removeParticipant(roomId: string, userId: string): Promise<StudyRoomEntity | null>;
  updateStatus(roomId: string, status: RoomStatus): Promise<StudyRoomEntity | null>;
}
