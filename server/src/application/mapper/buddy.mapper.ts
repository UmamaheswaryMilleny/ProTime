import type { BuddyPreferenceEntity, BuddyConnectionEntity } from '../../domain/entities/buddy.entities';
import type { ProfileEntity } from '../../domain/entities/profile.entity';

import type { BuddyPreferenceResponseDTO } from '../dto/buddy-match/response/buddy-preference.response.dto';
import type { BuddyProfileResponseDTO } from '../dto/buddy-match/response/buddy-profile.response.dto';
import type { BuddyConnectionResponseDTO } from '../dto/buddy-match/response/buddy-connection.response.dto';

export class BuddyMapper {

  // when the user views or saves their own preferences:
  static preferenceToResponse(
    entity: BuddyPreferenceEntity,
  ): BuddyPreferenceResponseDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      country: entity.country,
      studyGoal: entity.studyGoal,
      studyLanguage: entity.studyLanguage,
      frequency: entity.frequency,
      isVisible: entity.isVisible,
      lastActiveAt: entity.lastActiveAt,
      subjectDomain: entity.subjectDomain,
      availability: entity.availability,
      sessionDuration: entity.sessionDuration,
      focusLevel: entity.focusLevel,
      studyPreference: entity.studyPreference,
      groupStudy: entity.groupStudy,
      studyMode: entity.studyMode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }


  static preferenceToPublicProfile(
    entity: BuddyPreferenceEntity,
    profile: ProfileEntity,
  ): BuddyProfileResponseDTO {
    return {
      userId: entity.userId,
      fullName: profile.fullName,
      username: profile.username,
      bio: profile.bio,
      profileImage: profile.profileImage,
      country: entity.country,
      studyGoal: entity.studyGoal,
      studyLanguage: entity.studyLanguage,
      frequency: entity.frequency,
      lastActiveAt: entity.lastActiveAt,
      subjectDomain: entity.subjectDomain,
      availability: entity.availability,
      sessionDuration: entity.sessionDuration,
      focusLevel: entity.focusLevel,
      studyPreference: entity.studyPreference,
    };
  }

  static connectionToResponse(
    entity: BuddyConnectionEntity,
    buddy?: BuddyProfileResponseDTO,
  ): BuddyConnectionResponseDTO {
    return {
      id: entity.id,
      requesterId: entity.userId,
      receiverId: entity.buddyId,
      status: entity.status,
      blockedBy: entity.blockedBy,
      buddy: buddy,
      addedAt: entity.addedAt,
      rating: entity.rating,
      totalSessionsCompleted: entity.totalSessionsCompleted,
      totalSessionMinutes: entity.totalSessionMinutes,
      lastSessionAt: entity.lastSessionAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}