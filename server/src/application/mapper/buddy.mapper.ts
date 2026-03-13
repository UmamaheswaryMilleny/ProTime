import type { BuddyPreferenceEntity,BuddyConnectionEntity } from '../../domain/entities/buddy.entities';
import type { UserEntity } from '../../domain/entities/user.entity';
import type { BuddyPreferenceResponseDTO } from '../dto/buddy-match/response/buddy-preference.response.dto';
import type { BuddyProfileResponseDTO } from '../dto/buddy-match/response/buddy-profile.response.dto';
import type { BuddyConnectionResponseDTO } from '../dto/buddy-match/response/buddy-connection.response.dto';

export class BuddyMapper {

  // Own preference — full data returned to the owner
  static preferenceToResponse(
    entity: BuddyPreferenceEntity,
  ): BuddyPreferenceResponseDTO {
    return {
      id:               entity.id,
      userId:           entity.userId,
      timeZone:         entity.timeZone,
      country:          entity.country,
      studyGoal:        entity.studyGoal,
      studyLanguage:    entity.studyLanguage,
      frequency:        entity.frequency,
      bio:              entity.bio,
      isVisible:        entity.isVisible,
      lastActiveAt:     entity.lastActiveAt,
      subjectDomain:    entity.subjectDomain,
      availability:     entity.availability,
      sessionDuration:  entity.sessionDuration,
      focusLevel:       entity.focusLevel,
      studyPreference:  entity.studyPreference,
      groupStudy:       entity.groupStudy,
      studyMode:        entity.studyMode,
      createdAt:        entity.createdAt,
      updatedAt:        entity.updatedAt,
    };
  }

  // Public search result — merges preference data with user identity
  // groupStudy and studyMode are intentionally excluded
static preferenceToPublicProfile(
  entity: BuddyPreferenceEntity,
  user:   Pick<UserEntity, 'id' | 'fullName'>,
): BuddyProfileResponseDTO {
  return {
    userId:          entity.userId,
    fullName:        user.fullName,
    bio:             entity.bio,
    country:         entity.country,
    timeZone:        entity.timeZone,
    studyGoal:       entity.studyGoal,
    studyLanguage:   entity.studyLanguage,
    frequency:       entity.frequency,
    lastActiveAt:    entity.lastActiveAt,
    subjectDomain:   entity.subjectDomain,
    availability:    entity.availability,
    sessionDuration: entity.sessionDuration,
    focusLevel:      entity.focusLevel,
    studyPreference: entity.studyPreference,
  };
}

  static connectionToResponse(
    entity: BuddyConnectionEntity,
  ): BuddyConnectionResponseDTO {
    return {
      id:                     entity.id,
      userId:                 entity.userId,
      buddyId:                entity.buddyId,
      status:                 entity.status,
      addedAt:                entity.addedAt,
      rating:                 entity.rating,
      totalSessionsCompleted: entity.totalSessionsCompleted,
      totalSessionMinutes:    entity.totalSessionMinutes,
      lastSessionAt:          entity.lastSessionAt,
      createdAt:              entity.createdAt,
      updatedAt:              entity.updatedAt,
    };
  }
}