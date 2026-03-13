import { inject, injectable } from 'tsyringe';
import type { IFindBuddyMatchesUsecase } from '../../interface/buddy-match/find-buddy-matches.usecase.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { FindBuddyMatchesRequestDTO } from '../../../dto/buddy-match/request/find-buddy-matches.request.dto';
import type { PaginatedBuddyProfileResponseDTO } from '../../../dto/buddy-match/response/paginated-buddy-profile.response.dto';
import {
  BuddyPreferenceNotFoundError,
  AdvancedFilterNotAllowedError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class FindBuddyMatchesUsecase implements IFindBuddyMatchesUsecase {
  constructor(
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,

    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto:    FindBuddyMatchesRequestDTO,
  ): Promise<PaginatedBuddyProfileResponseDTO> {

    // Must have preferences set before searching
    const myPreference = await this.buddyPreferenceRepo.findByUserId(userId);
    if (!myPreference) throw new BuddyPreferenceNotFoundError();

    // Fetch isPremium from DB — not from JWT to avoid stale data
    const user      = await this.userRepo.findById(userId);
    const isPremium = user?.isPremium ?? false;

    // Guard: free users cannot trigger advanced filter matching
    const hasAdvancedFilters =
      myPreference.subjectDomain   !== undefined ||
      myPreference.availability    !== undefined ||
      myPreference.sessionDuration !== undefined ||
      myPreference.focusLevel      !== undefined ||
      myPreference.studyPreference !== undefined;

    if (!isPremium && hasAdvancedFilters) {
      throw new AdvancedFilterNotAllowedError();
    }

    // Exclude users already connected (any status — don't re-show declined/blocked either)
    const existingConnections = await this.buddyConnectionRepo.findByUserId(userId);
    const excludeUserIds = existingConnections.map(c =>
      c.userId === userId ? c.buddyId : c.userId,
    );

    let profiles: Awaited<ReturnType<typeof this.buddyPreferenceRepo.findMatchesByGoalAndCountry>>['profiles'];
    let total:    number;

    if (isPremium) {
      const result = await this.buddyPreferenceRepo.findMatchesByAdvancedFilters(
        userId,
        {
          studyGoal:       myPreference.studyGoal,
          country:         myPreference.country,
          subjectDomain:   myPreference.subjectDomain,
          availability:    myPreference.availability,
          sessionDuration: myPreference.sessionDuration,
          focusLevel:      myPreference.focusLevel,
          studyPreference: myPreference.studyPreference,
        },
        excludeUserIds,
        dto.page,
        dto.limit,
      );
      profiles = result.profiles;
      total    = result.total;
    } else {
      const result = await this.buddyPreferenceRepo.findMatchesByGoalAndCountry(
        userId,
        myPreference.studyGoal,
        myPreference.country,
        excludeUserIds,
        dto.page,
        dto.limit,
      );
      profiles = result.profiles;
      total    = result.total;
    }

    // Fetch user identity for each match in parallel
    const userIds  = profiles.map(p => p.userId);
    const users    = await Promise.all(userIds.map(id => this.userRepo.findById(id)));

    const profileDTOs = profiles.map((preference, i) => {
      const matchedUser = users[i];
      if (!matchedUser) return null;
      return BuddyMapper.preferenceToPublicProfile(preference, matchedUser);
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    return {
      profiles: profileDTOs,
      total,
      page:  dto.page,
      limit: dto.limit,
    };
  }
}