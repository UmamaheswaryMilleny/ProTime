import type { BuddyPreferenceDocument } from '../models/buddy-preference.model';
import type { BuddyPreferenceEntity } from '../../../domain/entities/buddy.entities';

export class BuddyPreferenceMapper {

  static toDomain(doc: BuddyPreferenceDocument): BuddyPreferenceEntity {
    return {
      id:              doc._id.toString(),
      userId:          doc.userId.toString(),
      country:         doc.country,
      studyGoal:       doc.studyGoal,
      studyLanguage:   doc.studyLanguage,
      frequency:       doc.frequency,
      isVisible:       doc.isVisible,
      lastActiveAt:    doc.lastActiveAt  ?? undefined,
      // premium fields — null in DB becomes undefined in entity
      subjectDomain:   doc.subjectDomain   ?? undefined,
      availability:    doc.availability    ?? undefined,
      sessionDuration: doc.sessionDuration ?? undefined,
      focusLevel:      doc.focusLevel      ?? undefined,
      studyPreference: doc.studyPreference ?? undefined,
      groupStudy:      doc.groupStudy      ?? undefined,
      studyMode:       doc.studyMode       ?? undefined,
      createdAt:       doc.createdAt,
      updatedAt:       doc.updatedAt,
    };
  }

  static toPersistence(
    data: Partial<Omit<BuddyPreferenceEntity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.country         !== undefined) result.country         = data.country;
    if (data.studyGoal       !== undefined) result.studyGoal       = data.studyGoal;
    if (data.studyLanguage   !== undefined) result.studyLanguage   = data.studyLanguage;
    if (data.frequency       !== undefined) result.frequency       = data.frequency;
    if (data.isVisible       !== undefined) result.isVisible       = data.isVisible;
    if (data.lastActiveAt    !== undefined) result.lastActiveAt    = data.lastActiveAt;


    // premium fields — undefined means "not provided, skip"
    // explicitly passing undefined clears the field to null in DB
    if (data.subjectDomain   !== undefined) result.subjectDomain   = data.subjectDomain   ?? null;
    if (data.availability    !== undefined) result.availability    = data.availability    ?? null;
    if (data.sessionDuration !== undefined) result.sessionDuration = data.sessionDuration ?? null;
    if (data.focusLevel      !== undefined) result.focusLevel      = data.focusLevel      ?? null;
    if (data.studyPreference !== undefined) result.studyPreference = data.studyPreference ?? null;
    if (data.groupStudy      !== undefined) result.groupStudy      = data.groupStudy      ?? null;
    if (data.studyMode       !== undefined) result.studyMode       = data.studyMode       ?? null;

    return result;
  }
}