export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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



