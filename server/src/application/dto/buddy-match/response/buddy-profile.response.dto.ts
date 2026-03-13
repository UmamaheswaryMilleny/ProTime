import type {
  StudyGoal, StudyFrequency, SubjectDomain,
  Availability, SessionDuration, FocusLevel, StudyPreference,
} from '../../../../domain/enums/buddy.enums';

export interface BuddyProfileResponseDTO {
  userId:        string;
  fullName:      string;   // ✅ was username
  bio?:          string;   // ✅ avatar removed — not on UserEntity
  country:       string;
  timeZone:      string;
  studyGoal:     StudyGoal;
  studyLanguage: string;
  frequency:     StudyFrequency;
  lastActiveAt?: Date;
  subjectDomain?:   SubjectDomain;
  availability?:    Availability;
  sessionDuration?: SessionDuration;
  focusLevel?:      FocusLevel;
  studyPreference?: StudyPreference;
}