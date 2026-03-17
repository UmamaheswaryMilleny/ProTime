import { inject, injectable } from 'tsyringe';
import type { IGetBlockedUsersUsecase } from '../../interface/buddy-match/get-blocked-users.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetBlockedUsersUsecase implements IGetBlockedUsersUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const blocked = await this.buddyConnectionRepo.findBlockedByUserId(userId);
    return blocked.map(entity => BuddyMapper.connectionToResponse(entity));
  }
}
