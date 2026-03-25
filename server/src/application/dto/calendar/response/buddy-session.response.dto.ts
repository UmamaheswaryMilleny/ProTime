import { SessionStatus } from '../../../../domain/enums/calendar.enums';

export interface BuddySessionResponseDTO {
  id:                string;
  conversationId:    string;
  buddyConnectionId: string;
  initiatorId:       string;
  participantId:     string;
  status:            SessionStatus;
  startedAt?:        Date;
  endedAt?:          Date;
  scheduledAt?:      Date;
  roomId?:           string;
  createdAt:         Date;
  updatedAt:         Date;
}
