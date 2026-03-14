import { inject, injectable } from 'tsyringe';
import type { IGetBuddyListUsecase } from '../../interface/buddy-match/get-buddy-list.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyConnectionResponseDTO } from '../../../dto/buddy-match/response/buddy-connection.response.dto';
import type { ProfileEntity } from '../../../../domain/entities/profile.entity';
import type { BuddyPreferenceEntity } from '../../../../domain/entities/buddy.entities';
import { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class GetBuddyListUsecase implements IGetBuddyListUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
    @inject('ProfileRepository')
    private readonly profileRepo: IProfileRepository,
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,
  ) {}

  async execute(userId: string): Promise<BuddyConnectionResponseDTO[]> {
    const connections = await this.buddyConnectionRepo.findByUserId(userId);
    const acceptedConnections = connections.filter(c => c.status === BuddyConnectionStatus.CONNECTED);
    
    if (acceptedConnections.length === 0) return [];

    const buddyIds = acceptedConnections.map(c => c.userId === userId ? c.buddyId : c.userId);
    
    const [profiles, preferences] = await Promise.all([
      this.profileRepo.findByUserIds(buddyIds),
      this.buddyPreferenceRepo.findByUserIds(buddyIds),
    ]);

    const profileMap = new Map<string, ProfileEntity>(profiles.map(p => [p.userId, p]));
    const prefMap = new Map<string, BuddyPreferenceEntity>(preferences.map(p => [p.userId, p]));

    return acceptedConnections.map(conn => {
      const buddyId = conn.userId === userId ? conn.buddyId : conn.userId;
      const profile = profileMap.get(buddyId);
      const pref = prefMap.get(buddyId);
      
      let buddyDto = undefined;
      if (profile && pref) {
        buddyDto = BuddyMapper.preferenceToPublicProfile(pref, profile);
      }
      
      return BuddyMapper.connectionToResponse(conn, buddyDto);
    });
  }
}