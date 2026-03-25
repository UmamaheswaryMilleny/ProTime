import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';

export interface SessionScheduleRequestResponseDTO {
  id:          string;
  sessionId?:  string;
  proposedBy:  string;
  proposedTo:  string;
  scheduledAt: Date;
  recurringDates?: Date[];
  durationMinutes?: number;
  status:      ScheduleConfirmStatus;
  proposerName: string;
  expiresAt:   Date;
  respondedAt?: Date;
  createdAt:   Date;
  updatedAt:   Date;
}
