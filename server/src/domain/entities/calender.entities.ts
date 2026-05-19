import type { SessionStatus, CalendarEventType, ScheduleConfirmStatus } from '../enums/calendar.enums';




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



export interface CalendarEventEntity {
  id:         string;
  userId:     string;
  type:       CalendarEventType;
  date:       string;      
  sessionId?: string;       
  todoId?:    string;     
  title:      string;     
  startTime?: string;      
  createdAt:  Date;
  updatedAt:  Date;
}



export interface SessionScheduleRequestEntity {
  id:            string;
  sessionId?:    string; 
  proposedBy:    string;
  proposedTo:    string;
  scheduledAt:   Date;
  recurringDates: Date[];
  durationMinutes: number;
  confirmStatus: ScheduleConfirmStatus;
  expiresAt:     Date;       // 24 hours after createdAt
  respondedAt?:  Date;
  createdAt:     Date;
  updatedAt:     Date;
}
