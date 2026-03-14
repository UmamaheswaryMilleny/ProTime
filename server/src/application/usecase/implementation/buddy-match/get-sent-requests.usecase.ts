import { inject, injectable } from 'tsyringe';
import type { IGetSentRequestsUsecase } from '../../interface/buddy-match/get-sent-requests.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import type { ProfileEntity } from '../../../../domain/entities/profile.entity';
import type { BuddyPreferenceEntity } from '../../../../domain/entities/buddy.entities';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetSentRequestsUsecase implements IGetSentRequestsUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
    @inject('ProfileRepository')
    private readonly profileRepo: IProfileRepository,
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const connections = await this.buddyConnectionRepo.findPendingByRequesterId(userId);
    if (connections.length === 0) return [];

    const receiverIds = connections.map(c => c.buddyId);
    const [profiles, preferences] = await Promise.all([
      this.profileRepo.findByUserIds(receiverIds),
      this.buddyPreferenceRepo.findByUserIds(receiverIds),
    ]);

    const profileMap = new Map<string, ProfileEntity>(profiles.map(p => [p.userId, p]));
    const prefMap = new Map<string, BuddyPreferenceEntity>(preferences.map(p => [p.userId, p]));

    return connections.map(conn => {
      const profile = profileMap.get(conn.buddyId);
      const pref = prefMap.get(conn.buddyId);
      
      let buddyDto = undefined;
      if (profile && pref) {
        buddyDto = BuddyMapper.preferenceToPublicProfile(pref, profile);
      }
      
      return BuddyMapper.connectionToResponse(conn, buddyDto);
    });
  }
}
