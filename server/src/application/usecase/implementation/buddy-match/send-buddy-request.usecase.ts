import { inject, injectable } from 'tsyringe';
import type { ISendBuddyRequestUsecase } from '../../interface/buddy-match/send-buddy-request.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import {
  BuddySelfMatchError,
  BuddyAlreadyConnectedError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';

@injectable()
export class SendBuddyRequestUsecase implements ISendBuddyRequestUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(requesterId: string, buddyId: string): Promise<void> {

    if (requesterId === buddyId) throw new BuddySelfMatchError();

    const existing = await this.buddyConnectionRepo.findConnection(requesterId, buddyId);
    if (existing) throw new BuddyAlreadyConnectedError();

    await this.buddyConnectionRepo.save({
      userId:                 requesterId,
      buddyId,
      status:                 BuddyConnectionStatus.PENDING,
      totalSessionsCompleted: 0,
      totalSessionMinutes:    0,
      createdAt:              new Date(),
      updatedAt:              new Date(),
    });
  }
}