import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { BaseRepository } from '../base.repository';


import { BuddyPreferenceModel, BuddyPreferenceDocument } from '../../database/models/buddy-preference.model';
import { BuddyPreferenceMapper } from '../../database/mappers/buddy-preference.mapper';
import type { IBuddyPreferenceRepository } from '../../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { BuddyPreferenceEntity } from '../../../domain/entities/buddy.entities';
import type { StudyGoal } from '../../../domain/enums/buddy.enums';
import { ProfileModel } from '../../database/models/profile.model';
import { SkillModel } from '../../database/models/skill.model';

@injectable()
export class BuddyPreferenceRepository
  extends BaseRepository<BuddyPreferenceDocument, BuddyPreferenceEntity>
  implements IBuddyPreferenceRepository
{
  constructor() {
    super(BuddyPreferenceModel, BuddyPreferenceMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<BuddyPreferenceEntity | null> {
    const doc = await BuddyPreferenceModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    if (!doc) return null;
    return BuddyPreferenceMapper.toDomain(doc as BuddyPreferenceDocument);
  }

  // ─── Unified Matching ─────────────────────────────────────────────────────
  async findMatches(
    excludeUserId:  string,
    studyGoal:      StudyGoal,
    studyLanguage:  string,
    country:        string,
    excludeUserIds: string[],
    page:           number,
    limit:          number,
    search?:        string,
    global?:        boolean,
    premiumFilters?: Partial<Pick<BuddyPreferenceEntity,
      | 'subjectDomain'
      | 'availability'
      | 'sessionDuration'
      | 'focusLevel'
      | 'studyPreference'
    >>,
  ): Promise<{ profiles: BuddyPreferenceEntity[]; total: number }> {
     
    const query: any = {
      userId:    { $nin: [new mongoose.Types.ObjectId(excludeUserId), ...excludeUserIds.map(id => new mongoose.Types.ObjectId(id))] },
      isVisible: true,
    };

    // Base filters: Goal and Language are always required for a good match
    query.studyGoal = { $regex: `^${studyGoal}$`, $options: 'i' };
    query.studyLanguage = { $regex: `^${studyLanguage}$`, $options: 'i' };

    if (!global) {
      query.country = { $regex: `^${country}$`, $options: 'i' };
    }

    // Apply Premium Filters if provided
    if (premiumFilters) {
      if (premiumFilters.subjectDomain)   query.subjectDomain   = premiumFilters.subjectDomain;
      if (premiumFilters.availability)    query.availability    = premiumFilters.availability;
      if (premiumFilters.sessionDuration) query.sessionDuration = premiumFilters.sessionDuration;
      if (premiumFilters.focusLevel)      query.focusLevel      = premiumFilters.focusLevel;
      if (premiumFilters.studyPreference) query.studyPreference = premiumFilters.studyPreference;
    }

    // Search complements the filters rather than overriding them
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        
        // Find matching skills
        const matchingSkills = await SkillModel.find({ name: searchRegex }).select('_id').lean();
        const skillIds = matchingSkills.map(s => s._id);

        // Find profiles matching username, fullName, or skills
        const matchingProfiles = await ProfileModel.find({
            $or: [
                { fullName: searchRegex },
                { username: searchRegex },
                { skills: { $in: skillIds } }
            ]
        }).select('userId').lean();
        const userIdsFromProfiles = matchingProfiles.map(p => p.userId);

        query.$or = [
            { studyGoal: searchRegex },
            { studyLanguage: searchRegex },
            { country: searchRegex },
            { subjectDomain: searchRegex },
            { userId: { $in: userIdsFromProfiles } }
        ];
    }

    const [docs, total] = await Promise.all([
      BuddyPreferenceModel
        .find(query)
        .sort({ lastActiveAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BuddyPreferenceModel.countDocuments(query),
    ]);

    console.log(`[BuddyPrefRepo] unified query: ${JSON.stringify(query)}`);
    console.log(`[BuddyPrefRepo] total: ${total} | docs: ${docs.length}`);

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
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const doc = await BuddyPreferenceModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set:         update,
        $setOnInsert: { userId: userObjectId },
      },
      { upsert: true, new: true },
    ).lean();

    return BuddyPreferenceMapper.toDomain(doc as BuddyPreferenceDocument);
  }

  async findByUserIds(userIds: string[]): Promise<BuddyPreferenceEntity[]> {
    const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));
    const docs = await BuddyPreferenceModel.find({ userId: { $in: objectIds } }).lean();
    return docs.map(d => BuddyPreferenceMapper.toDomain(d as BuddyPreferenceDocument));
  }
}