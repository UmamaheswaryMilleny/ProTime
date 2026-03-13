import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { BuddyPreferenceModel, BuddyPreferenceDocument } from '../../database/models/buddy-preference.model';
import { BuddyPreferenceMapper } from '../../database/mappers/buddy-preference.mapper';
import type { IBuddyPreferenceRepository } from '../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyPreferenceEntity } from '../../../domain/entities/buddy.entities';
import type { StudyGoal } from '../../../domain/enums/buddy.enums';

@injectable()
export class BuddyPreferenceRepository
  extends BaseRepository<BuddyPreferenceDocument, BuddyPreferenceEntity>
  implements IBuddyPreferenceRepository
{
  constructor() {
    super(BuddyPreferenceModel, BuddyPreferenceMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<BuddyPreferenceEntity | null> {
    const doc = await BuddyPreferenceModel.findOne({ userId }).lean();
    if (!doc) return null;
    return BuddyPreferenceMapper.toDomain(doc as BuddyPreferenceDocument);
  }

  // ─── Free matching ────────────────────────────────────────────────────────
  async findMatchesByGoalAndCountry(
    excludeUserId:  string,
    studyGoal:      StudyGoal,
    country:        string,
    excludeUserIds: string[],
    page:           number,
    limit:          number,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }> {
    const query = {
      userId:    { $nin: [excludeUserId, ...excludeUserIds] },
      studyGoal,
      country,
      isVisible: true,
    };

    const [docs, total] = await Promise.all([
      BuddyPreferenceModel
        .find(query)
        .sort({ lastActiveAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BuddyPreferenceModel.countDocuments(query),
    ]);

    return {
      profiles: docs.map(d => BuddyPreferenceMapper.toDomain(d as BuddyPreferenceDocument)),
      total,
    };
  }

  // ─── Premium matching ─────────────────────────────────────────────────────
  async findMatchesByAdvancedFilters(
    excludeUserId:  string,
    filters:        Partial<Pick<BuddyPreferenceEntity,
      | 'studyGoal' | 'country' | 'subjectDomain' | 'availability'
      | 'sessionDuration' | 'focusLevel' | 'studyPreference'
    >>,
    excludeUserIds: string[],
    page:           number,
    limit:          number,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }> {

    const query: Record<string, unknown> = {
      userId:    { $nin: [excludeUserId, ...excludeUserIds] },
      isVisible: true,
    };

    if (filters.studyGoal)       query.studyGoal       = filters.studyGoal;
    if (filters.country)         query.country         = filters.country;
    if (filters.subjectDomain)   query.subjectDomain   = filters.subjectDomain;
    if (filters.availability)    query.availability    = filters.availability;
    if (filters.sessionDuration) query.sessionDuration = filters.sessionDuration;
    if (filters.focusLevel)      query.focusLevel      = filters.focusLevel;
    if (filters.studyPreference) query.studyPreference = filters.studyPreference;

    const [docs, total] = await Promise.all([
      BuddyPreferenceModel
        .find(query)
        .sort({ lastActiveAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BuddyPreferenceModel.countDocuments(query),
    ]);

    return {
      profiles: docs.map(d => BuddyPreferenceMapper.toDomain(d as BuddyPreferenceDocument)),
      total,
    };
  }

  // ─── Upsert ───────────────────────────────────────────────────────────────
  async upsertByUserId(
    userId: string,
    data:   Partial<Omit<BuddyPreferenceEntity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<BuddyPreferenceEntity> {
    const update = BuddyPreferenceMapper.toPersistence(data);

    const doc = await BuddyPreferenceModel.findOneAndUpdate(
      { userId },
      {
        $set:         update,
        $setOnInsert: { userId },
      },
      { upsert: true, new: true },
    ).lean();

    return BuddyPreferenceMapper.toDomain(doc as BuddyPreferenceDocument);
  }
}