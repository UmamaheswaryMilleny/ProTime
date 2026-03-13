import type {
  StudyGoal, StudyFrequency, SubjectDomain, Availability,
  SessionDuration, FocusLevel, StudyPreference, GroupStudy, StudyMode,
} from '../../../../domain/enums/buddy.enums';

export interface BuddyPreferenceResponseDTO {
  id:            string;
  userId:        string;
  // free fields
  timeZone:      string;
  country:       string;
  studyGoal:     StudyGoal;
  studyLanguage: string;
  frequency:     StudyFrequency;
  bio?:          string;
  isVisible:     boolean;
  lastActiveAt?: Date;
  // premium fields
  subjectDomain?:   SubjectDomain;
  availability?:    Availability;
  sessionDuration?: SessionDuration;
  focusLevel?:      FocusLevel;
  studyPreference?: StudyPreference;
  groupStudy?:      GroupStudy;
  studyMode?:       StudyMode;
  createdAt: Date;
  updatedAt: Date;
}