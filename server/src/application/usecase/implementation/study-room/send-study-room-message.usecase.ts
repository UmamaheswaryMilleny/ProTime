import { inject, injectable } from "tsyringe";
import type { ISendStudyRoomMessageUsecase } from "../../interface/study-room/send-study-room-message.usecase.interface";
import { SendStudyRoomMessageDTO, StudyRoomMessageResponseDTO } from "../../../dtos/study-room.dto";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IStudyRoomMessageRepository } from "../../../../domain/repositories/study-room/study-room-message.repository.interface";
import type { ISocketService } from "../../../service_interface/socket-service.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import { RoomNotFoundError, UnauthorizedRoomActionError } from "../../../../domain/errors/study-room.errors";
import { UserNotFoundError } from "../../../../domain/errors/user.error";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";

@injectable()
export class SendStudyRoomMessageUsecase implements ISendStudyRoomMessageUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepository: IStudyRoomRepository,
    @inject('IStudyRoomMessageRepository') private studyRoomMessageRepository: IStudyRoomMessageRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IProfileRepository') private profileRepository: IProfileRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(userId: string, roomId: string, dto: SendStudyRoomMessageDTO): Promise<StudyRoomMessageResponseDTO> {
    const room = await this.studyRoomRepository.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== userId && !room.participantIds.includes(userId)) {
      throw new UnauthorizedRoomActionError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError();

    const profile = await this.profileRepository.findByUserId(userId);

    const messageEntity = await this.studyRoomMessageRepository.save({
      roomId: room.id!,
      senderId: userId,
      content: dto.content,
    } as any);

    const messageDTO: StudyRoomMessageResponseDTO = {
      id: messageEntity.id!,
      roomId: messageEntity.roomId,
      senderId: messageEntity.senderId,
      senderName: user.fullName,
      senderAvatar: profile ? profile.profileImage : undefined,
      content: messageEntity.content,
      createdAt: messageEntity.createdAt.toISOString(),
      updatedAt: messageEntity.updatedAt.toISOString(),
    };

    if (this.socketService.emitToRoom) {
      this.socketService.emitToRoom(roomId, 'room:new-message', messageDTO);
    }

    return messageDTO;
  }
}
