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
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  APP_DEVELOPMENT = 'APP_DEVELOPMENT',
  UI_UX = 'UI_UX',
  DATA_SCIENCE = 'DATA_SCIENCE',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  DEVOPS = 'DEVOPS',
  AI_ML = 'AI_ML',
  CYBER_SECURITY = 'CYBER_SECURITY',
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
  ANY = 'ANY',
  SOLO = 'SOLO',
  GROUP = 'GROUP',
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
