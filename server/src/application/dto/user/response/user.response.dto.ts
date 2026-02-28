import { UserRole } from "../../../../domain/enums/user.enums";

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
}


export interface PaginatedUsersResponseDTO {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



