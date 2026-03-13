import { inject, injectable } from 'tsyringe';
import type { IRespondToBuddyRequestUsecase } from '../../interface/buddy-match/respond-to-buddy-request.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { RespondToBuddyRequestDTO } from '../../../dto/buddy-match/request/respond-to-buddy-request.request.dto';
import {
  BuddyNotFoundError,
  UnauthorizedBuddyActionError,
  BuddyRequestAlreadyRespondedError,
  BuddyMatchLimitError,
} from '../../../../domain/errors/buddy.errors';

import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import { FREE_MONTHLY_BUDDY_MATCHES } from '../../../../shared/constants/constants';

@injectable()
export class RespondToBuddyRequestUsecase implements IRespondToBuddyRequestUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    receiverId:   string,
    connectionId: string,
    dto:          RespondToBuddyRequestDTO,
  ): Promise<void> {

    // 1. Fetch connection
    const connection = await this.buddyConnectionRepo.findById(connectionId);
    if (!connection) throw new BuddyNotFoundError();

    // 2. Only the receiver can respond
    if (connection.buddyId !== receiverId) throw new UnauthorizedBuddyActionError();

    // 3. Must still be PENDING — cannot respond twice
    if (connection.status !== BuddyConnectionStatus.PENDING) {
      throw new BuddyRequestAlreadyRespondedError();
    }

    // 4. Decline — no quota consumed
    if (dto.action === 'DECLINE') {
      await this.buddyConnectionRepo.updateStatus(connectionId, BuddyConnectionStatus.DECLINED);
      return;
    }

    // 5. Accept — quota check on BOTH sides (both gain a connection)
    const [requester, receiver] = await Promise.all([
      this.userRepo.findById(connection.userId),
      this.userRepo.findById(receiverId),
    ]);

    const requesterIsPremium = requester?.isPremium ?? false;
    const receiverIsPremium  = receiver?.isPremium  ?? false;

    const [requesterCount, receiverCount] = await Promise.all([
      requesterIsPremium
        ? Promise.resolve(0)
        : this.buddyConnectionRepo.countAcceptedThisMonth(connection.userId),
      receiverIsPremium
        ? Promise.resolve(0)
        : this.buddyConnectionRepo.countAcceptedThisMonth(receiverId),
    ]);

    if (
      (!requesterIsPremium && requesterCount >= FREE_MONTHLY_BUDDY_MATCHES) ||
      (!receiverIsPremium  && receiverCount  >= FREE_MONTHLY_BUDDY_MATCHES)
    ) {
      throw new BuddyMatchLimitError();
    }

    // 6. Set CONNECTED + addedAt — quota consumed here
    await this.buddyConnectionRepo.updateStatus(connectionId, BuddyConnectionStatus.CONNECTED);
  }
}