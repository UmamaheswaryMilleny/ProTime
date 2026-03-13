import type { BuddyProfileResponseDTO } from './buddy-profile.response.dto';

export interface PaginatedBuddyProfileResponseDTO {
  profiles: BuddyProfileResponseDTO[];
  total:    number;
  page:     number;
  limit:    number;
}