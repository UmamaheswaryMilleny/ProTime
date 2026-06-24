import { inject, injectable } from 'tsyringe';
import type { IExpireStudyRoomsUsecase } from '../../interface/study-room/expire-study-rooms.usecase.interface';
import type { IStudyRoomRepository } from '../../../../domain/repositories/study-room/study-room.repository.interface';
import { RoomStatus } from '../../../../domain/enums/study-room.enums';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class ExpireStudyRoomsUsecase implements IExpireStudyRoomsUsecase {
  constructor(
    @inject('IStudyRoomRepository')
    private readonly studyRoomRepo: IStudyRoomRepository,
    @inject('ISocketService')
    private readonly socketService: ISocketService,
  ) {}

  async execute(): Promise<void> {
    logger.info('[ExpireStudyRoomsUsecase] Scanning for expired live study rooms...');
    try {
      const liveRooms = await this.studyRoomRepo.findAllLive();
      const now = Date.now();

      for (const room of liveRooms) {
        if (!room.sessionStartedAt) continue;

        const startTimeMs = new Date(room.sessionStartedAt).getTime();
        const baseDurationMs = 30 * 60 * 1000; // 30 minutes
        const extensionMs = (room.sessionExtensionSeconds || 0) * 1000;
        const graceMs = 5 * 60 * 1000; // 5 minutes grace period

        const expirationTimeMs = startTimeMs + baseDurationMs + extensionMs + graceMs;

        if (now > expirationTimeMs) {
          logger.warn(`[ExpireStudyRoomsUsecase] Room "${room.name}" (${room.id}) is expired. Expiration target was ${new Date(expirationTimeMs).toISOString()}. Expiring it now...`);

          // Update status to ENDED and clear all participants
          await this.studyRoomRepo.updateById(room.id!, {
            status: RoomStatus.ENDED,
            participantIds: [],
          });

          // Notify clients in the room via socket
          if (typeof this.socketService.emitToRoom === 'function') {
            this.socketService.emitToRoom(room.id!, 'room:ended', { roomId: room.id! });
            logger.info(`[ExpireStudyRoomsUsecase] Emitted room:ended socket event for room ${room.id}`);
          }
        }
      }
    } catch (error) {
      logger.error('[ExpireStudyRoomsUsecase] Error occurred during check:', error);
    }
  }
}
