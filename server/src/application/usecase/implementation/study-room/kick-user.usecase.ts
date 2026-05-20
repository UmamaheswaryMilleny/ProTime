import { inject, injectable } from "tsyringe";
import type { IKickUserUsecase } from "../../interface/study-room/kick-user.usecase.interface";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class KickUserUsecase implements IKickUserUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(hostId: string, roomId: string, userIdToKick: string): Promise<void> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.hostId !== hostId) {
      throw new Error("Only the host can kick users");
    }

    const updatedRoom = await this.studyRoomRepo.removeParticipant(roomId, userIdToKick);

    if (updatedRoom) {
      if (typeof this.socketService.emitToRoom === 'function') {
        this.socketService.emitToRoom(roomId, 'room:user-kicked', { roomId, userId: userIdToKick });
      }
    }
  }
}
