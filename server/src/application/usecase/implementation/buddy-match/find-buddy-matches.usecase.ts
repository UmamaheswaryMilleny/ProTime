import { inject, injectable } from 'tsyringe';
import type { IFindBuddyMatchesUsecase } from '../../interface/buddy-match/find-buddy-matches.usecase.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import type { FindBuddyMatchesRequestDTO } from '../../../dto/buddy-match/request/find-buddy-matches.request.dto';
import type { PaginatedBuddyProfileResponseDTO } from '../../../dto/buddy-match/response/paginated-buddy-profile.response.dto';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

const { log } = console;

@injectable()
export class FindBuddyMatchesUsecase implements IFindBuddyMatchesUsecase {
  constructor(
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,

    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,

    @inject('IProfileRepository')
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    dto:    FindBuddyMatchesRequestDTO,
  ): Promise<PaginatedBuddyProfileResponseDTO> {

    const myPreference = await this.buddyPreferenceRepo.findByUserId(userId);
    log(`[FindBuddyMatches] userId: ${userId}`);
    log(`[FindBuddyMatches] myPreference: ${myPreference ? `goal=${myPreference.studyGoal} country=${myPreference.country} visible=${myPreference.isVisible}` : 'NOT FOUND'}`);

    if (!myPreference) {
      return { profiles: [], total: 0, page: dto.page, limit: dto.limit };
    }

    // Fetch isPremium from DB — not from JWT to avoid stale data
    const user      = await this.userRepo.findById(userId);
    const isPremium = user?.isPremium ?? false;

    // Exclude users already connected (any status)
    const existingConnections = await this.buddyConnectionRepo.findByUserId(userId);
    const excludeUserIds = existingConnections.map(c =>
      c.userId === userId ? c.buddyId : c.userId,
    );
    log(`[FindBuddyMatches] isPremium: ${isPremium} | excludeUserIds count: ${excludeUserIds.length}`);

    const result = await this.buddyPreferenceRepo.findMatches(
      userId,
      myPreference.studyGoal,
      myPreference.studyLanguage,
      myPreference.country,
      excludeUserIds,
      dto.page,
      dto.limit,
      dto.search,
      dto.global === 'true',
      isPremium ? {
        subjectDomain:   myPreference.subjectDomain,
        availability:    myPreference.availability,
        sessionDuration: myPreference.sessionDuration,
        focusLevel:      myPreference.focusLevel,
        studyPreference: myPreference.studyPreference,
      } : undefined
    );
    const profiles = result.profiles;
    const total    = result.total;

    log(`[FindBuddyMatches] profiles from DB: ${total} | returned: ${profiles.length}`);

    const userIds = profiles.map(p => p.userId);
    const matchedProfiles = await this.profileRepo.findByUserIds(userIds);
    // Create a map for quick lookup since findByUserIds might not return profiles in same order as userIds
    const profileMap = new Map(matchedProfiles.map(p => [p.userId, p]));

    const profileDTOs = profiles.map((preference) => {
      const profile = profileMap.get(preference.userId);
      if (!profile) {
        log(`[FindBuddyMatches] ⚠️ No profile found for userId: ${preference.userId}`);
        return null;
      }
      return BuddyMapper.preferenceToPublicProfile(preference, profile);
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    log(`[FindBuddyMatches] final profileDTOs returned: ${profileDTOs.length}`);

    return {
      profiles: profileDTOs,
      total,
      page:  dto.page,
      limit: dto.limit,
    };
  }
}