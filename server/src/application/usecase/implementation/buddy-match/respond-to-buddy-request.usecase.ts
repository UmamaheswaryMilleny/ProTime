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
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';

import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import { FREE_MONTHLY_BUDDY_MATCHES } from '../../../../shared/constants/constants';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';

import { NotificationType } from '../../../service_interface/notification-service.interface';
import type { INotificationService } from '../../../service_interface/notification-service.interface';

@injectable()
export class RespondToBuddyRequestUsecase implements IRespondToBuddyRequestUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @inject('IConversationRepository')
    private readonly conversationRepo: IConversationRepository,
    @inject('IProfileRepository')
    private readonly profileRepo: IProfileRepository,
    @inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) { }

  async execute(
    receiverId: string,
    connectionId: string,
    dto: RespondToBuddyRequestDTO,
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
    // Auto-create conversation room when buddies connect
    // user1Id is always lexicographically smaller — prevents duplicate rooms
    const [user1Id, user2Id] = [connection.userId, receiverId].sort();
    const existing = await this.conversationRepo.findByBuddyConnectionId(connection.id);
    if (!existing) {
      await this.conversationRepo.save({
        buddyConnectionId: connection.id,
        user1Id,
        user2Id,
      });
    }
    // 5. Accept — quota check on BOTH sides (both gain a connection)
    const [requester, receiver] = await Promise.all([
      this.userRepo.findById(connection.userId),
      this.userRepo.findById(receiverId),
    ]);

    const requesterIsPremium = requester?.isPremium ?? false;
    const receiverIsPremium = receiver?.isPremium ?? false;

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
      (!receiverIsPremium && receiverCount >= FREE_MONTHLY_BUDDY_MATCHES)
    ) {
      throw new BuddyMatchLimitError();
    }

    // 6. Set CONNECTED + addedAt — quota consumed here
    await this.buddyConnectionRepo.updateStatus(connectionId, BuddyConnectionStatus.CONNECTED);

    // Notify requester
    try {
      const receiverProfile = await this.profileRepo.findByUserId(receiverId);
      const receiverName = receiverProfile?.username || receiverProfile?.fullName || 'Someone';

      this.notificationService.notifyUser(connection.userId, {
        type: NotificationType.BUDDY_ACCEPTED,
        title: 'Study Buddy Found!',
        message: `@${receiverName} accepted your study buddy request. Go say hi!`,
        metadata: { connectionId, buddyId: receiverId }
      });
    } catch (_error) {
       // Ignore
    }
  }
}