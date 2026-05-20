// ─── Free user matching fields ────────────────────────────────────────────────

export enum StudyGoal {
  TECHNOLOGY = 'TECHNOLOGY',
  ACADEMICS = 'ACADEMICS',
  LANGUAGES = 'LANGUAGES',
  TEST_PREPARATION = 'TEST_PREPARATION',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  OTHER = 'OTHER',
}

export enum StudyFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  WEEKENDS = 'WEEKENDS',
  FLEXIBLE = 'FLEXIBLE',
}

// ─── Premium advanced settings fields ────────────────────────────────────────

export enum SubjectDomain {
  // ─── TECHNOLOGY ───────────────────────────────
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  APP_DEVELOPMENT = 'APP_DEVELOPMENT',
  UI_UX = 'UI_UX',
  DATA_SCIENCE = 'DATA_SCIENCE',
  DEVOPS = 'DEVOPS',
  AI_ML = 'AI_ML',
  CYBER_SECURITY = 'CYBER_SECURITY',

  // ─── ACADEMICS ────────────────────────────────
  MATHEMATICS = 'MATHEMATICS',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  HISTORY = 'HISTORY',

  // ─── LANGUAGES ────────────────────────────────
  FRENCH = 'FRENCH',
  SPANISH = 'SPANISH',
  JAPANESE = 'JAPANESE',
  GERMAN = 'GERMAN',
  ARABIC = 'ARABIC',

  // ─── TEST_PREPARATION ─────────────────────────
  GATE = 'GATE',
  GRE = 'GRE',
  IELTS = 'IELTS',
  UPSC = 'UPSC',
  CAT = 'CAT',

  // ─── MACHINE_LEARNING ─────────────────────────
  DEEP_LEARNING = 'DEEP_LEARNING',
  NLP = 'NLP',
  COMPUTER_VISION = 'COMPUTER_VISION',
  REINFORCEMENT = 'REINFORCEMENT',
  MLOPS = 'MLOPS',

  // ─── OTHER ────────────────────────────────────
  OTHERS = 'OTHERS',
}

export enum Availability {
  MORNING = 'MORNING',
  NOON = 'NOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  FLEXIBLE = 'FLEXIBLE',
}

export enum SessionDuration {
  MIN_25 = 'MIN_25',
  MIN_45 = 'MIN_45',
  HOUR_1 = 'HOUR_1',
  HOUR_2 = 'HOUR_2',
  FLEXIBLE = 'FLEXIBLE',
}

export enum FocusLevel {
  CASUAL = 'CASUAL',
  MODERATE = 'MODERATE',
  HIGH_INTENSITY = 'HIGH_INTENSITY',
}

export enum StudyPreference {
  CHAT_ONLY = 'CHAT_ONLY',
  VIDEO_ONLY = 'VIDEO_ONLY',
  FLEXIBLE = 'FLEXIBLE',
}

export enum GroupStudy {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

export enum StudyMode {
  // ANY = 'ANY',
  TOGEHTER = 'TOGETHER',
  SOLO = 'SOLO',
  // GROUP = 'GROUP',
}

// ─── Connection lifecycle ─────────────────────────────────────────────────────
// PENDING   → request sent, receiver has not responded yet
// CONNECTED → receiver accepted — quota consumed at this point
// DECLINED  → receiver declined the request
// BLOCKED   → one user blocked the other
export enum BuddyConnectionStatus {
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
}

// Maps each StudyGoal to its valid SubjectDomain options.
// Used for backend validation and frontend dropdown filtering.
// When user selects a StudyGoal, only show SubjectDomains from this map.
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
