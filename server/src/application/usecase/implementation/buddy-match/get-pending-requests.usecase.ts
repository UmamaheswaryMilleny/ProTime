import { inject, injectable } from 'tsyringe';
import type { IGetPendingRequestsUsecase } from '../../interface/buddy-match/get-pending-requests.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetPendingRequestsUsecase implements IGetPendingRequestsUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const pending = await this.buddyConnectionRepo.findPendingByReceiverId(userId);
    return pending.map(BuddyMapper.connectionToResponse);
  }
}