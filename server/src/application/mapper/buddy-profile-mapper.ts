import type { IBuddyProfileEntity } from "../../domain/entities/buddy-profile.entity.js";
import type { BuddyProfileResponseDTO } from "../dto/response/buddy-profile-response.dto.js";

export class BuddyProfileMapper {
  static toResponseDTO(profile: IBuddyProfileEntity): BuddyProfileResponseDTO {
    return {
      studyGoals: profile.studyGoals,
      subjects: profile.subjects,
      timezone: profile.timezone,
      availability: profile.availability,
      studyDurationMinutes: profile.studyDurationMinutes,
      focusLevel: profile.focusLevel,
      studyPreference: profile.studyPreference,
      groupStudy: profile.groupStudy,
    };
  }
}
