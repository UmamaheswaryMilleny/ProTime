import type { IBaseRepository } from '../base/base.repository.interface';
import type { BuddyPreferenceEntity } from '../../entities/buddy.entities';
import type { StudyGoal } from '../../enums/buddy.enums';

export interface IBuddyPreferenceRepository
  extends IBaseRepository<BuddyPreferenceEntity> {

  // Fetches the single preference document belonging to one specific user.
  findByUserId(userId: string): Promise<BuddyPreferenceEntity | null>;


  // sorted by lastActiveAt desc — active users appear first.

  findMatches(
    excludeUserId: string,
    studyGoal: StudyGoal,
    studyLanguage: string,
    country: string,
    excludeUserIds: string[],   // already connected — exclude from results
    page: number,
    limit: number,
    search?: string,
    global?: boolean,
    premiumFilters?: Partial<Pick<BuddyPreferenceEntity,
      | 'subjectDomain'
      | 'availability'
      | 'sessionDuration'
      | 'focusLevel'
      | 'studyPreference'
    >>,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }>;

  // Create if not exists, update if exists
  upsertByUserId(
    userId: string,
    data: Partial<Omit<BuddyPreferenceEntity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<BuddyPreferenceEntity>;

  findByUserIds(userIds: string[]): Promise<BuddyPreferenceEntity[]>;
}