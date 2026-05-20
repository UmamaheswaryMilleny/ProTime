import type { SessionStatus, CalendarEventType, ScheduleConfirmStatus } from '../enums/calendar.enums';


// ─── BuddySessionEntity ───────────────────────────────────────────────────────
// notes removed — notes are private per user, stored in SessionNoteEntity
export interface BuddySessionEntity {
  id:                string;
  conversationId:    string;
  buddyConnectionId: string;
  initiatorId:       string;
  participantId:     string;
  status:            SessionStatus;
  scheduledAt?:      Date;
  startedAt?:        Date;
  endedAt?:          Date;
  roomId:            string;
  createdAt:         Date;
  updatedAt:         Date;
}

// ─── SessionNoteEntity ────────────────────────────────────────────────────────
// Private per user — only the user who typed them can see them.
// Created or updated on explicit "Save Notes" click only — never auto-saved.
// One note document per user per session — upsert on save.
export interface SessionNoteEntity {
  id:        string;
  sessionId: string;   // links to BuddySessionEntity
  userId:    string;   // only this user can see these notes
  content:   string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── CalendarEventEntity ─────────────────────────────────────────────────────
// Lightweight pointer — no status/endTime/buddyId fields.
// status and times are derived from BuddySessionEntity when needed.
// One event per user per session/task — each user has their own record.
// createdFrom removed — derivable from whether sessionId or todoId is set.
export interface CalendarEventEntity {
  id:         string;
  userId:     string;
  type:       CalendarEventType;
  date:       string;       // YYYY-MM-DD — for fast calendar queries
  sessionId?: string;       // set when type is SESSION
  todoId?:    string;       // set when type is TASK
  title:      string;       // session: buddy name, task: todo title
  startTime?: string;       // HH:MM — display only
  createdAt:  Date;
  updatedAt:  Date;
}

// ─── SessionScheduleRequestEntity ────────────────────────────────────────────
// expiresAt added — 24 hours after creation.
// Cron marks PENDING requests past expiresAt as EXPIRED.
export interface SessionScheduleRequestEntity {
  id:            string;
  sessionId?:    string; // Optional for recurring
  proposedBy:    string;
  proposedTo:    string;
  scheduledAt:   Date;
  recurringDates: Date[];
  durationMinutes: number;
  confirmStatus: ScheduleConfirmStatus;
  expiresAt:     Date;       // ← added — 24 hours after createdAt
  respondedAt?:  Date;
  createdAt:     Date;
  updatedAt:     Date;
}
