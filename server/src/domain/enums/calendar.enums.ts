export enum SessionStatus {
  PLANNED   = 'PLANNED',
  ACTIVE    = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  MISSED    = 'MISSED',
}

export enum CalendarEventType {
  TASK    = 'TASK',
  SESSION = 'SESSION',
}

export enum ScheduleConfirmStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED  = 'REJECTED',
  EXPIRED   = 'EXPIRED',   // ← added
}
