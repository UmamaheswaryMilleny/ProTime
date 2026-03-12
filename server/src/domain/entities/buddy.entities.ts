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

// ─── BuddyPreferenceEntity ────────────────────────────────────────────────────
// One document per user — stores both free and premium preference fields.
// Free fields drive basic matching (studyGoal + country).
// Premium fields are all optional — preserved if premium lapses but
// ignored in matching until the user re-subscribes.
// lastActiveAt is updated on every pomodoro completion — used to sort
// active users first in search results.
export interface BuddyPreferenceEntity {
  id:            string;
  userId:        string;

  // ─── Free fields ──────────────────────────────────────────────────────────
  timeZone:      string;          // IANA e.g. "Asia/Kolkata", "America/New_York"
  country:       string;          // e.g. "India", "USA" — used for free matching
  studyGoal:     StudyGoal;
  studyLanguage: string;          // e.g. "English", "Hindi"
  frequency:     StudyFrequency;
  bio?:          string;          // max 300 chars — shown on public profile
  isVisible:     boolean;         // false = hidden from all search results
  lastActiveAt?: Date;            // updated on every pomodoro completion — drives activity sort

  // ─── Premium fields — Advanced Settings ───────────────────────────────────
  // All optional — undefined if user is on free plan or hasn't set them
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

// ─── BuddyConnectionEntity ───────────────────────────────────────────────────
// Represents a connection between two users — created when requester sends
// a request (PENDING), updated when receiver accepts (CONNECTED).
// Quota is consumed at the moment status becomes CONNECTED.
// addedAt is set when receiver accepts — this is the timestamp used
// to count connections in the rolling 30-day window for free users.
// Session stats are updated after each 1:1 session ends.
export interface BuddyConnectionEntity {
  id:                     string;
  userId:                 string;          // the user who sent the request
  buddyId:                string;          // the user who received the request
  status:                 BuddyConnectionStatus;
  addedAt?:                Date;            // set when receiver accepts — quota consumed here
  rating?:                number;          // 1–5 stars given after session
  totalSessionsCompleted: number;
  totalSessionMinutes:    number;          // accumulated — badge requires min 60 min
  lastSessionAt?:         Date;
  createdAt:              Date;
  updatedAt:              Date;
}