import type { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';

export interface BuddyConnectionResponseDTO {
  id:                     string;
  userId:                 string;
  buddyId:                string;
  status:                 BuddyConnectionStatus;
  addedAt?:               Date;
  rating?:                number;
  totalSessionsCompleted: number;
  totalSessionMinutes:    number;
  lastSessionAt?:         Date;
  createdAt:              Date;
  updatedAt:              Date;
}