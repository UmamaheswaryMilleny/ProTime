import { inject, injectable } from "tsyringe";
import type { ILeaveRoomUsecase } from "../../interface/study-room/leave-room.usecase.interface";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import { RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class LeaveRoomUsecase implements ILeaveRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(userId: string, roomId: string): Promise<void> {
    const updatedRoom = await this.studyRoomRepo.removeParticipant(roomId, userId);

    if (updatedRoom) {
      if (typeof this.socketService.emitToRoom === 'function') {
        this.socketService.emitToRoom(roomId, 'room:user-left', { roomId, userId });
      }

      // If the host left and there are participants left, we could transfer host.
      // But for MVP, if the host leaves, we optionally end the room or let it be.
      // Instructions specify "end room for MVP" if host leaves and participants remain.
      if (userId === updatedRoom.hostId) {
        // If host leaves, end the room for everyone
        await this.studyRoomRepo.updateStatus(roomId, RoomStatus.ENDED);
        if (typeof this.socketService.emitToRoom === 'function') {
          this.socketService.emitToRoom(roomId, 'room:ended', { roomId });
        }
      }
    }
  }
}
