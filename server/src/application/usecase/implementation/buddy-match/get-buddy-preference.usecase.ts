import { inject, injectable } from 'tsyringe';
import type { IGetBuddyPreferenceUsecase } from '../../interface/buddy-match/get-buddy-preference.usecase.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyPreferenceResponseDTO } from '../../../dto/buddy-match/response/buddy-preference.response.dto';

import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetBuddyPreferenceUsecase implements IGetBuddyPreferenceUsecase {
  constructor(
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,
  ) {}

  async execute(userId: string): Promise<BuddyPreferenceResponseDTO | null> {
    const preference = await this.buddyPreferenceRepo.findByUserId(userId);
    if (!preference) return null;
    return BuddyMapper.preferenceToResponse(preference);
  }
}