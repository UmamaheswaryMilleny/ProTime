import { inject, injectable } from "tsyringe";
import type { IGetRoomsUsecase } from "../../interface/study-room/get-rooms.usecase.interface";
import { GetRoomsRequestDTO, GetRoomsResponseDTO, StudyRoomResponseDTO } from "../../../dtos/study-room.dto";
import { RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";

@injectable()
export class GetRoomsUsecase implements IGetRoomsUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
  ) {}

  async execute(dto: GetRoomsRequestDTO): Promise<GetRoomsResponseDTO> {
    // When no explicit status is requested (normal Explore tab usage),
    // exclude ENDED rooms — users should only see WAITING or LIVE rooms.
    const { rooms, total } = await this.studyRoomRepo.findAll({
      type:         dto.type,
      status:       dto.status,        // undefined means "all active" (repo handles this)
      excludeEnded: !dto.status,       // true when no status filter → exclude ENDED
      search:       dto.search,
      page:         dto.page  || 1,
      limit:        dto.limit || 20,
    });

    const roomResponses: StudyRoomResponseDTO[] = await Promise.all(
      rooms.map(async (room) => {
        // Only mark as ENDED if endTime passed more than 5 minutes ago and host never started
        // This prevents rooms from being instantly expired due to timezone/clock differences
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (room.status === RoomStatus.WAITING && room.endTime && new Date(room.endTime) < fiveMinutesAgo) {
          room.status = RoomStatus.ENDED;
          await this.studyRoomRepo.updateStatus(room.id!, RoomStatus.ENDED);
        }
        const hostUser = await this.userRepo.findById(room.hostId);
        return {
          id: room.id!,
          hostId: room.hostId,
          hostName: hostUser?.fullName || 'Unknown',
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
          isLive: room.status === RoomStatus.LIVE,
          participantIds: room.participantIds,
          createdAt: room.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: room.updatedAt?.toISOString() || new Date().toISOString()
        };
      })
    );

    return {
      rooms: roomResponses,
      total,
      page: dto.page || 1,
      limit: dto.limit || 20,
    };
  }
}
