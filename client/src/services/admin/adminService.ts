import { ProTimeBackend } from "../../api/instance";
import type { AxiosResponse } from "axios";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UserStatusFilter = "all" | "blocked" | "unblocked";
export type SortOrder = "asc" | "desc";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatusFilter;
  sort?: string;
  order?: SortOrder;
}

export const adminApi = {
  getUsers: async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      data: PaginatedUsersResponse;
    }> = await ProTimeBackend.get("/admin/users", { params });
    return response.data.data;
  },

  getUserDetails: async (userId: string): Promise<User> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      data: User;
    }> = await ProTimeBackend.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  blockUser: async (userId: string): Promise<void> => {
    await ProTimeBackend.patch(`/admin/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await ProTimeBackend.patch(`/admin/users/${userId}/unblock`);
  },
};



