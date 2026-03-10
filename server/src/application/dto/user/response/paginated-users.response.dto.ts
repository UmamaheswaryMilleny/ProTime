import { UserResponseDTO } from './user.response.dto';
export interface PaginatedUsersResponseDTO {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
