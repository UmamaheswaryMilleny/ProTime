import type {
  StudyGoal,
  StudyFrequency,
  SubjectDomain,
  Availability,
  SessionDuration,
  FocusLevel,
  StudyPreference,
  GroupStudy,
  StudyMode,
  BuddyConnectionStatus,
} from '../enums/buddy.enums';

export interface BuddyPreferenceEntity {
  id: string;
  userId: string;

  // Free fields 
  country: string;
  studyGoal: StudyGoal;
  studyLanguage: string;
  frequency: StudyFrequency;
  isVisible: boolean;         // false = hidden from all search results
  lastActiveAt?: Date;

  //Premium fields  

  subjectDomain?: SubjectDomain;
  availability?: Availability;
  sessionDuration?: SessionDuration;
  focusLevel?: FocusLevel;
  studyPreference?: StudyPreference;
  groupStudy?: GroupStudy;
  studyMode?: StudyMode;

  createdAt: Date;
  updatedAt: Date;
}

//starts the moment a request is sent
export interface BuddyConnectionEntity {
  id: string;
  userId: string;          // the user who sent the request
  buddyId: string;          // the user who received the request
  status: BuddyConnectionStatus;
  blockedBy?: string;
  addedAt?: Date;            // set when receiver accepts — quota consumed here
  rating?: number;          // 1–5 stars given after session
  totalSessionsCompleted: number;
  totalSessionMinutes: number;
  lastSessionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}