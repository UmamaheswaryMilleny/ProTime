import type { CalendarEventType } from '../../../../domain/enums/calendar.enums';
import type { SessionNoteResponseDTO } from './session-note.response.dto';
import type { BuddySessionResponseDTO } from './buddy-session.response.dto';

export interface CalendarEventResponseDTO {
  id:         string;
  userId:     string;
  type:       CalendarEventType;
  date:       string;
  title:      string;
  startTime?: string;
  session?:   BuddySessionResponseDTO;
  buddy?: {
    userId:   string;
    fullName: string;
  };
  note?:      SessionNoteResponseDTO;
  todo?: {
    id:           string;
    title:        string;
    description?: string;
    isCompleted:  boolean;
  };
  createdAt:  Date;
  updatedAt:  Date;
}
