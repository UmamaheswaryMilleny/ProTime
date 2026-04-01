// client/src/features/calendar/types/calendar.types.ts

export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
export type CalendarEventType = 'TASK' | 'SESSION';
export type ScheduleConfirmStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';

export interface BaseSession {
  id: string;
  conversationId: string;
  buddyConnectionId: string;
  initiatorId: string;
  participantId: string;
  status: SessionStatus;
  scheduledAt: string;
  roomId?: string;
}

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  title: string;
  isCompleted?: boolean;
  session?: BaseSession;
  buddy?: {
    userId: string;
    fullName: string;
  };
  note?: SessionNote;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface DayDetail {
  date: string;
  events: CalendarEvent[];
  sessions: BaseSession[];
  notes: SessionNote[];
}

export interface PendingScheduleRequest {
  id: string;
  sessionId?: string;
  proposedBy: string;
  proposedTo: string;
  scheduledAt: string; // ISO string
  recurringDates?: string[];
  durationMinutes?: number;
  status: ScheduleConfirmStatus;
  proposerName: string; 
  createdAt: string;
}

export interface RespondRequestPayload {
  requestId: string;
  status: 'CONFIRMED' | 'REJECTED';
}
