import { inject, injectable } from 'tsyringe';
import type { ISaveBuddyPreferenceUsecase } from '../../interface/buddy-match/save-buddy-preference.usecase.interface';
import type { IBuddyPreferenceRepository } from '../../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { SaveBuddyPreferenceRequestDTO } from '../../../dto/buddy-match/request/save-buddy-preference.request.dto';
import type { BuddyPreferenceResponseDTO } from '../../../dto/buddy-match/response/buddy-preference.response.dto';
import { STUDY_GOAL_DOMAIN_MAP } from '../../../../domain/enums/buddy.enums';
import { InvalidSubjectDomainError } from '../../../../domain/errors/buddy.errors';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class SaveBuddyPreferenceUsecase implements ISaveBuddyPreferenceUsecase {
  constructor(
    @inject('IBuddyPreferenceRepository')
    private readonly buddyPreferenceRepo: IBuddyPreferenceRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto:    SaveBuddyPreferenceRequestDTO,
  ): Promise<BuddyPreferenceResponseDTO> {

    // Fetch isPremium from DB — not from JWT to avoid stale data
    const user      = await this.userRepo.findById(userId);
    const isPremium = user?.isPremium ?? false;

    if (isPremium && dto.subjectDomain) {
      const validDomains = STUDY_GOAL_DOMAIN_MAP[dto.studyGoal];
      if (!validDomains.includes(dto.subjectDomain)) {
        throw new InvalidSubjectDomainError();
      }
    }

    // Always save free fields
    const data: Parameters<IBuddyPreferenceRepository['upsertByUserId']>[1] = {
      country:       dto.country,
      studyGoal:     dto.studyGoal,
      studyLanguage: dto.studyLanguage,
      frequency:     dto.frequency,
      isVisible:     dto.isVisible,
    };

    // Always save all fields (identity traits)
    // This allows free users to be found by premium filters, ensuring reciprocity
    data.subjectDomain   = dto.subjectDomain;
    data.availability    = dto.availability;
    data.sessionDuration = dto.sessionDuration;
    data.focusLevel      = dto.focusLevel;
    data.studyPreference = dto.studyPreference;
    data.groupStudy      = dto.groupStudy;
    data.studyMode       = dto.studyMode;

    const preference = await this.buddyPreferenceRepo.upsertByUserId(userId, data);
    return BuddyMapper.preferenceToResponse(preference);
  }
}