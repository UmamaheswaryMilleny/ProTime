export const StudyGoal = {
  TECHNOLOGY: 'TECHNOLOGY',
  ACADEMICS: 'ACADEMICS',
  LANGUAGES: 'LANGUAGES',
  TEST_PREPARATION: 'TEST_PREPARATION',
  MACHINE_LEARNING: 'MACHINE_LEARNING',
  OTHER: 'OTHER',
} as const;
export type StudyGoal = typeof StudyGoal[keyof typeof StudyGoal];

export const StudyFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  WEEKENDS: 'WEEKENDS',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type StudyFrequency = typeof StudyFrequency[keyof typeof StudyFrequency];

export const SubjectDomain = {
  // ─── TECHNOLOGY ───────────────────────────────
  WEB_DEVELOPMENT: 'WEB_DEVELOPMENT',
  APP_DEVELOPMENT: 'APP_DEVELOPMENT',
  UI_UX: 'UI_UX',
  DATA_SCIENCE: 'DATA_SCIENCE',
  DEVOPS: 'DEVOPS',
  AI_ML: 'AI_ML',
  CYBER_SECURITY: 'CYBER_SECURITY',

  // ─── ACADEMICS ────────────────────────────────
  MATHEMATICS: 'MATHEMATICS',
  PHYSICS: 'PHYSICS',
  CHEMISTRY: 'CHEMISTRY',
  BIOLOGY: 'BIOLOGY',
  HISTORY: 'HISTORY',

  // ─── LANGUAGES ────────────────────────────────
  FRENCH: 'FRENCH',
  SPANISH: 'SPANISH',
  JAPANESE: 'JAPANESE',
  GERMAN: 'GERMAN',
  ARABIC: 'ARABIC',

  // ─── TEST_PREPARATION ─────────────────────────
  GATE: 'GATE',
  GRE: 'GRE',
  IELTS: 'IELTS',
  UPSC: 'UPSC',
  CAT: 'CAT',

  // ─── MACHINE_LEARNING ─────────────────────────
  DEEP_LEARNING: 'DEEP_LEARNING',
  NLP: 'NLP',
  COMPUTER_VISION: 'COMPUTER_VISION',
  REINFORCEMENT: 'REINFORCEMENT',
  MLOPS: 'MLOPS',

  // ─── OTHER ────────────────────────────────────
  OTHERS: 'OTHERS',
} as const;
export type SubjectDomain = typeof SubjectDomain[keyof typeof SubjectDomain];

export const STUDY_GOAL_DOMAIN_MAP: Record<StudyGoal, SubjectDomain[]> = {
  [StudyGoal.TECHNOLOGY]: [
    SubjectDomain.WEB_DEVELOPMENT,
    SubjectDomain.APP_DEVELOPMENT,
    SubjectDomain.UI_UX,
    SubjectDomain.DATA_SCIENCE,
    SubjectDomain.DEVOPS,
    SubjectDomain.AI_ML,
    SubjectDomain.CYBER_SECURITY,
  ],
  [StudyGoal.ACADEMICS]: [
    SubjectDomain.MATHEMATICS,
    SubjectDomain.PHYSICS,
    SubjectDomain.CHEMISTRY,
    SubjectDomain.BIOLOGY,
    SubjectDomain.HISTORY,
  ],
  [StudyGoal.LANGUAGES]: [
    SubjectDomain.FRENCH,
    SubjectDomain.SPANISH,
    SubjectDomain.JAPANESE,
    SubjectDomain.GERMAN,
    SubjectDomain.ARABIC,
  ],
  [StudyGoal.TEST_PREPARATION]: [
    SubjectDomain.GATE,
    SubjectDomain.GRE,
    SubjectDomain.IELTS,
    SubjectDomain.UPSC,
    SubjectDomain.CAT,
  ],
  [StudyGoal.MACHINE_LEARNING]: [
    SubjectDomain.DEEP_LEARNING,
    SubjectDomain.NLP,
    SubjectDomain.COMPUTER_VISION,
    SubjectDomain.REINFORCEMENT,
    SubjectDomain.MLOPS,
  ],
  [StudyGoal.OTHER]: [
    SubjectDomain.OTHERS,
  ],
};

export const Availability = {
  MORNING: 'MORNING',
  NOON: 'NOON',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type Availability = typeof Availability[keyof typeof Availability];

export const SessionDuration = {
  MIN_25: 'MIN_25',
  MIN_45: 'MIN_45',
  HOUR_1: 'HOUR_1',
  HOUR_2: 'HOUR_2',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type SessionDuration = typeof SessionDuration[keyof typeof SessionDuration];

export const FocusLevel = {
  CASUAL: 'CASUAL',
  MODERATE: 'MODERATE',
  HIGH_INTENSITY: 'HIGH_INTENSITY',
} as const;
export type FocusLevel = typeof FocusLevel[keyof typeof FocusLevel];

export const StudyPreference = {
  CHAT_ONLY: 'CHAT_ONLY',
  VIDEO_ONLY: 'VIDEO_ONLY',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type StudyPreference = typeof StudyPreference[keyof typeof StudyPreference];

export const GroupStudy = {
  YES: 'YES',
  NO: 'NO',
  MAYBE: 'MAYBE',
} as const;
export type GroupStudy = typeof GroupStudy[keyof typeof GroupStudy];

export const StudyMode = {
  ANY: 'ANY',
  SOLO: 'SOLO',
  GROUP: 'GROUP',
} as const;
export type StudyMode = typeof StudyMode[keyof typeof StudyMode];

export const BuddyConnectionStatus = {
  PENDING: 'PENDING',
  CONNECTED: 'CONNECTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
  SENT: 'SENT',
} as const;
export type BuddyConnectionStatus = typeof BuddyConnectionStatus[keyof typeof BuddyConnectionStatus];

export interface BuddyProfile {
  userId: string;
  fullName: string;
  username: string;
  bio?: string;
  country: string;
  studyGoal: StudyGoal;
  studyLanguage: string;
  frequency: StudyFrequency;
  lastActiveAt?: string;
  subjectDomain?: SubjectDomain;
  availability?: Availability;
  sessionDuration?: SessionDuration;
  focusLevel?: FocusLevel;
  studyPreference?: StudyPreference;
  profileImage?: string;
  avatar?: string;
}

export interface BuddyPreference {
  id: string;
  userId: string;
  country: string;
  studyGoal: StudyGoal;
  studyLanguage: string;
  frequency: StudyFrequency;
  isVisible: boolean;
  subjectDomain?: SubjectDomain;
  availability?: Availability;
  sessionDuration?: SessionDuration;
  focusLevel?: FocusLevel;
  studyPreference?: StudyPreference;
  groupStudy?: GroupStudy;
  studyMode?: StudyMode;
}

export interface SaveBuddyPreferenceRequest {
  country: string;
  studyGoal: StudyGoal;
  studyLanguage: string;
  frequency: StudyFrequency;
  isVisible: boolean;
  subjectDomain?: SubjectDomain;
  availability?: Availability;
  sessionDuration?: SessionDuration;
  focusLevel?: FocusLevel;
  studyPreference?: StudyPreference;
  groupStudy?: GroupStudy;
  studyMode?: StudyMode;
}

export interface BuddyConnection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: BuddyConnectionStatus;
  createdAt: string;
  updatedAt: string;
  buddy?: BuddyProfile;
}
