import type {
  StudyGoal, StudyFrequency, SubjectDomain,
  Availability, SessionDuration, FocusLevel, StudyPreference,
} from '../../../../domain/enums/buddy.enums';

export interface BuddyProfileResponseDTO {
  userId:        string;
  fullName:      string;
  username:      string;
  bio?:          string;
  profileImage?: string;
  country:       string;
  studyGoal:     StudyGoal;
  studyLanguage: string;
  frequency:     StudyFrequency;
  lastActiveAt?: Date;
  subjectDomain?:   string;
  availability?:    Availability;
  sessionDuration?: SessionDuration;
  focusLevel?:      FocusLevel;
  studyPreference?: StudyPreference;
  skills?:          any[];
  averageRating?:   number;
  ratingCount?:     number;
}