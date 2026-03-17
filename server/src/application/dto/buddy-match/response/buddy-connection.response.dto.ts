import type { BuddyConnectionStatus } from '../../../../domain/enums/buddy.enums';
import type { BuddyProfileResponseDTO } from './buddy-profile.response.dto';

export interface BuddyConnectionResponseDTO {
  id:                     string;
  requesterId:            string;
  receiverId:             string;
  status:                 BuddyConnectionStatus;
  blockedBy?:             string;
  buddy?:                 BuddyProfileResponseDTO;
  addedAt?:               Date;
  rating?:                number;
  totalSessionsCompleted: number;
  totalSessionMinutes:    number;
  lastSessionAt?:         Date;
  createdAt:              Date;
  updatedAt:              Date;
}