import { inject, injectable } from 'tsyringe';
import type { IUnblockBuddyUsecase } from '../../interface/buddy-match/unblock-buddy.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import {
  BuddyNotFoundError,
  UnauthorizedUnblockError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';

@injectable()
export class UnblockBuddyUsecase implements IUnblockBuddyUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(userId: string, connectionId: string): Promise<void> {
    const connection = await this.buddyConnectionRepo.findById(connectionId);
    if (!connection) throw new BuddyNotFoundError();

    // Only the person who blocked can unblock
    if (connection.blockedBy !== userId) throw new UnauthorizedUnblockError();

    // Set back to DECLINED — strangers again, not buddies
    // DECLINED means either side can send a fresh request
    await this.buddyConnectionRepo.updateStatusWithBlockedBy(
      connectionId,
      BuddyConnectionStatus.DECLINED,
      undefined, // clear blockedBy
    );
  }
}
