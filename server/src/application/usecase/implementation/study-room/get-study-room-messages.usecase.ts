import { inject, injectable } from "tsyringe";
import type { IGetStudyRoomMessagesUsecase } from "../../interface/study-room/get-study-room-messages.usecase.interface";
import { StudyRoomMessageResponseDTO } from "../../../dtos/study-room.dto";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IStudyRoomMessageRepository } from "../../../../domain/repositories/study-room/study-room-message.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import { RoomNotFoundError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";

@injectable()
export class GetStudyRoomMessagesUsecase implements IGetStudyRoomMessagesUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepository: IStudyRoomRepository,
    @inject('IStudyRoomMessageRepository') private studyRoomMessageRepository: IStudyRoomMessageRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IProfileRepository') private profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string, roomId: string, page: number, limit: number): Promise<{ messages: StudyRoomMessageResponseDTO[], total: number }> {
    const room = await this.studyRoomRepository.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== userId && !room.participantIds.includes(userId)) {
      throw new UnauthorizedRoomActionError();
    }

    const { messages, total } = await this.studyRoomMessageRepository.findByRoomId(roomId, page, limit);

    const senderIds = [...new Set(messages.map(m => m.senderId))];
    const users = await Promise.all(senderIds.map(id => this.userRepository.findById(id)));
    const profiles = await Promise.all(senderIds.map(id => this.profileRepository.findByUserId(id)));

    const dtos: StudyRoomMessageResponseDTO[] = messages.map(msg => {
      const u = users.find(u => u && u.id === msg.senderId);
      const p = profiles.find(p => p && p.userId === msg.senderId);
      return {
        id: msg.id!,
        roomId: msg.roomId,
        senderId: msg.senderId,
        senderName: u ? u.fullName : 'Unknown',
        senderAvatar: p ? p.profileImage : undefined,
        content: msg.content || '',
        fileUrl: msg.fileUrl,
        fileType: msg.fileType,
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
      };
    }).reverse();

    return { messages: dtos, total };
  }
}
