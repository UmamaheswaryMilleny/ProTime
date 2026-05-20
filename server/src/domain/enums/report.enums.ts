export enum ReportStatus {
  PENDING   = 'PENDING',
  RESOLVED  = 'RESOLVED',   // action was taken
  DISMISSED = 'DISMISSED',  // admin reviewed but no action needed
}

export enum ReportContext {
  CHAT       = 'CHAT',       // ← consistent with rest of codebase
  VIDEO_CALL = 'VIDEO_CALL', // ← no spaces
  GROUP_ROOM = 'GROUP_ROOM',
}

export enum ReportReason {
  SPAM                  = 'SPAM',
  HARASSMENT            = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  FAKE_PROFILE          = 'FAKE_PROFILE',
  HATE_SPEECH           = 'HATE_SPEECH',
  VIOLENCE              = 'VIOLENCE',
  NUDITY                = 'NUDITY',
  FALSE_INFORMATION     = 'FALSE_INFORMATION',
  OTHER                 = 'OTHER',
}

export enum ReportAction {
  WARNING         = 'WARNING',
  TEMPORARY_BLOCK = 'TEMPORARY_BLOCK',
  PERMANENT_BLOCK = 'PERMANENT_BLOCK',
  NO_ACTION       = 'NO_ACTION',
}