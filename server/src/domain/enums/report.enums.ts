export enum ReportStatus {
  PENDING   = 'PENDING',
  RESOLVED  = 'RESOLVED',  
  DISMISSED = 'DISMISSED',  
}

export enum ReportContext {
  CHAT       = 'CHAT',      
  VIDEO_CALL = 'VIDEO_CALL',
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