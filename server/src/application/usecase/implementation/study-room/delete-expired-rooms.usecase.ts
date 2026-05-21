import { inject, injectable } from 'tsyringe';
import type { IDeleteExpiredRoomsUsecase } from '../../interface/study-room/delete-expired-rooms.usecase.interface';
import type { IStudyRoomRepository } from '../../../../domain/repositories/study-room/study-room.repository.interface';
import { logger } from '../../../../infrastructure/config/logger.config';

/**
 * Runs daily at 02:00.
 *
 * Finds all study rooms with status=ENDED whose `updatedAt` is older than
 * EXPIRY_DAYS (default 3 days) and hard-deletes them from the database.
 *
 * Design decision: we delete the room document entirely (not just archive it)
 * because room messages are stored in a separate collection and already cleaned
 * up by TTL or cascade on room deletion. If you prefer a soft-delete, replace
 * `deleteById` with an `updateStatus(id, DELETED)` call.
 */
@injectable()
export class DeleteExpiredRoomsUsecase implements IDeleteExpiredRoomsUsecase {
  /** Number of days after a room ends before it is permanently deleted. */
  private static readonly EXPIRY_DAYS = 3;

  constructor(
    @inject('IStudyRoomRepository')
    private readonly studyRoomRepo: IStudyRoomRepository,
  ) {}

  async execute(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DeleteExpiredRoomsUsecase.EXPIRY_DAYS);

    logger.info(
      `[DeleteExpiredRoomsUsecase] Scanning for ENDED rooms updated before ${cutoff.toISOString()}...`,
    );

    const expiredRooms = await this.studyRoomRepo.findEndedBefore(cutoff);

    if (expiredRooms.length === 0) {
      logger.info('[DeleteExpiredRoomsUsecase] No expired rooms to delete.');
      return;
    }

    logger.warn(
      `[DeleteExpiredRoomsUsecase] Deleting ${expiredRooms.length} expired room(s)...`,
    );

    for (const room of expiredRooms) {
      try {
        await this.studyRoomRepo.deleteById(room.id!);
        logger.info(`[DeleteExpiredRoomsUsecase] Deleted room "${room.name}" (${room.id})`);
      } catch (err: unknown) {
        // One failure must not block the rest
        logger.error(
          `[DeleteExpiredRoomsUsecase] Failed to delete room ${room.id}:`,
          err,
        );
      }
    }
  }
}
