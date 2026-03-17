import { inject, injectable } from 'tsyringe';
import type { IBlockBuddyUsecase } from '../../interface/buddy-match/block-buddy.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import {
  BuddySelfMatchError,
  BuddyAlreadyBlockedError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';

@injectable()
export class BlockBuddyUsecase implements IBlockBuddyUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(userId: string, targetUserId: string): Promise<void> {
    // Cannot block yourself
    if (userId === targetUserId) throw new BuddySelfMatchError();

    const existing = await this.buddyConnectionRepo.findConnection(userId, targetUserId);

    if (existing) {
      // Already blocked
      if (existing.status === BuddyConnectionStatus.BLOCKED) {
        throw new BuddyAlreadyBlockedError();
      }
      // Existing connection — update to BLOCKED and set blockedBy
      await this.buddyConnectionRepo.updateStatusWithBlockedBy(
        existing.id,
        BuddyConnectionStatus.BLOCKED,
        userId,
      );
    } else {
      // No connection yet — create one directly as BLOCKED
      // Prevents target from appearing in search results or sending requests
      await this.buddyConnectionRepo.save({
        userId,
        buddyId:                targetUserId,
        status:                 BuddyConnectionStatus.BLOCKED,
        blockedBy:              userId,
        totalSessionsCompleted: 0,
        totalSessionMinutes:    0,
      });
    }
  }
}
