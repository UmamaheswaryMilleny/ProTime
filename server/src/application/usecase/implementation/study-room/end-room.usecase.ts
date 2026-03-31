import { inject, injectable } from "tsyringe";
import type { IEndRoomUsecase } from "../../interface/study-room/end-room.usecase.interface";
import { RoomStatus } from "../../../../domain/enums/study-room.enums";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import { UnauthorizedRoomActionError, RoomNotFoundError } from "../../../../domain/errors/study-room.errors";
import type { ISocketService } from "../../../../application/service_interface/socket-service.interface";

@injectable()
export class EndRoomUsecase implements IEndRoomUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('ISocketService') private socketService: ISocketService,
  ) {}

  async execute(hostId: string, roomId: string): Promise<void> {
    const room = await this.studyRoomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError();

    if (room.hostId !== hostId) throw new UnauthorizedRoomActionError();

    await this.studyRoomRepo.updateStatus(roomId, RoomStatus.ENDED);

    if (typeof this.socketService.emitToRoom === 'function') {
      this.socketService.emitToRoom(roomId, 'room:ended', { roomId });
    }
  }
}
