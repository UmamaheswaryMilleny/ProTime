import { inject, injectable } from 'tsyringe';
import type { IGetPendingRequestsUsecase } from '../../interface/buddy-match/get-pending-requests.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import type { ProfileEntity } from '../../../../domain/entities/profile.entity';
import type { BuddyPreferenceEntity } from '../../../../domain/entities/buddy.entities';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetPendingRequestsUsecase implements IGetPendingRequestsUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
    @inject('IProfileRepository')
    private readonly profileRepo: IProfileRepository,
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const pending = await this.buddyConnectionRepo.findPendingByReceiverId(userId);
    if (pending.length === 0) return [];

    const requesterIds = pending.map(c => c.userId);
    const [profiles, preferences] = await Promise.all([
      this.profileRepo.findByUserIds(requesterIds),
      this.buddyPreferenceRepo.findByUserIds(requesterIds),
    ]);

    const profileMap = new Map<string, ProfileEntity>(profiles.map(p => [p.userId, p]));
    const prefMap = new Map<string, BuddyPreferenceEntity>(preferences.map(p => [p.userId, p]));

    return pending.map(conn => {
      const profile = profileMap.get(conn.userId);
      const pref = prefMap.get(conn.userId);
      
      let buddyDto = undefined;
      if (profile && pref) {
        buddyDto = BuddyMapper.preferenceToPublicProfile(pref, profile);
      }
      
      return BuddyMapper.connectionToResponse(conn, buddyDto);
    });
  }
}