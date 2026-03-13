import { inject, injectable } from 'tsyringe';
import type { IGetBuddyListUsecase } from '../../interface/buddy-match/get-buddy-list.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetBuddyListUsecase implements IGetBuddyListUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const connections = await this.buddyConnectionRepo.findByUserId(userId);
    // Only return accepted connections — pending/declined/blocked excluded
    return connections
      .filter(c => c.status === BuddyConnectionStatus.CONNECTED)
      .map(BuddyMapper.connectionToResponse);
  }
}