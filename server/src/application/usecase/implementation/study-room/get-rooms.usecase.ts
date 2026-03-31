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
    const { rooms, total } = await this.studyRoomRepo.findAll({
      type: dto.type,
      status: dto.status,
      search: dto.search,
      page: dto.page || 1,
      limit: dto.limit || 20,
    });

    const roomResponses: StudyRoomResponseDTO[] = await Promise.all(
      rooms.map(async (room) => {
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
