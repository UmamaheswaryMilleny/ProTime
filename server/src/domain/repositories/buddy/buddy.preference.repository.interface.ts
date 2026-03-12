import type { IBaseRepository } from '../base/base.repository.interface';
import type { BuddyPreferenceEntity } from '../../entities/buddy.entities';
import type { StudyGoal } from '../../enums/buddy.enums';

export interface IBuddyPreferenceRepository
  extends IBaseRepository<BuddyPreferenceEntity> {

  // One preference document per user
  findByUserId(userId: string): Promise<BuddyPreferenceEntity | null>;

  // ─── Free matching ─────────────────────────────────────────────────────────
  // Matches on studyGoal + country, excludes already-connected users,
  // sorted by lastActiveAt desc — active users appear first.
  // Returns paginated results.
  findMatchesByGoalAndCountry(
    excludeUserId:  string,
    studyGoal:      StudyGoal,
    country:        string,
    excludeUserIds: string[],   // already connected — exclude from results
    page:           number,
    limit:          number,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }>;

  // ─── Premium matching ──────────────────────────────────────────────────────
  // All filter fields are optional — only provided ones are applied.
  // Also sorted by lastActiveAt desc and paginated.
  findMatchesByAdvancedFilters(
    excludeUserId:  string,
    filters: Partial<Pick<BuddyPreferenceEntity,
      | 'studyGoal'
      | 'country'
      | 'subjectDomain'
      | 'availability'
      | 'sessionDuration'
      | 'focusLevel'
      | 'studyPreference'
    >>,
    excludeUserIds: string[],
    page:           number,
    limit:          number,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }>;

  // Create if not exists, update if exists
  upsertByUserId(
    userId: string,
    data: Partial<Omit<BuddyPreferenceEntity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<BuddyPreferenceEntity>;
}