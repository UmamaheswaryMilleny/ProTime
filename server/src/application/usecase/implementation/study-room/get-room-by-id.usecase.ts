import { inject, injectable } from "tsyringe";
import type { IGetRoomByIdUsecase } from "../../interface/study-room/get-room-by-id.usecase.interface";
import { StudyRoomResponseDTO } from "../../../dtos/study-room.dto";
import { RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";
import { RoomNotFoundError } from "../../../../domain/errors/study-room.errors";

@injectable()
export class GetRoomByIdUsecase implements IGetRoomByIdUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IProfileRepository') private profileRepo: IProfileRepository,
  ) {}

  async execute(roomId: string): Promise<StudyRoomResponseDTO> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    const hostUser = await this.userRepo.findById(room.hostId);
    const hostProfile = await this.profileRepo.findByUserId(room.hostId);
    const participantProfiles = await this.profileRepo.findByUserIds(room.participantIds);

    return {
      id: room.id!,
      hostId: room.hostId,
      hostName: hostUser?.fullName || 'Unknown',
      hostAvatar: hostProfile?.profileImage || undefined,
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
      participants: participantProfiles.map(p => ({
        id: p.userId,
        name: p.fullName,
        avatar: p.profileImage || undefined
      })),
      createdAt: room.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: room.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
