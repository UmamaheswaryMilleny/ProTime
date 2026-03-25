import { inject, injectable } from 'tsyringe';
import type { ISendBuddyRequestUsecase } from '../../interface/buddy-match/send-buddy-request.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import {
  BuddySelfMatchError,
  BuddyAlreadyConnectedError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';

@injectable()
export class SendBuddyRequestUsecase implements ISendBuddyRequestUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
    @inject('IProfileRepository')
    private readonly profileRepo: IProfileRepository,
    @inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(requesterId: string, buddyId: string): Promise<void> {

    if (requesterId === buddyId) throw new BuddySelfMatchError();

    const existing = await this.buddyConnectionRepo.findConnection(requesterId, buddyId);
    if (existing) throw new BuddyAlreadyConnectedError();

    await this.buddyConnectionRepo.save({
      userId: requesterId,
      buddyId,
      status: BuddyConnectionStatus.PENDING,
      totalSessionsCompleted: 0,
      totalSessionMinutes: 0,
    });

    // Notify recipient
    try {
      const requesterProfile = await this.profileRepo.findByUserId(requesterId);
      const requesterName = requesterProfile?.username || requesterProfile?.fullName || 'Someone';
      
      this.notificationService.notifyUser(buddyId, {
        type: NotificationType.BUDDY_REQUEST,
        title: 'New Buddy Request!',
        message: `@${requesterName} wants to be your study buddy.`,
        metadata: { requesterId }
      });
    } catch (error) {
      // Don't fail the request if notification fails
    }
  }
}