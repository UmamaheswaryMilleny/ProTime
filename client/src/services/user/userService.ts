import { ProTimeBackend } from "../../api/instance";
import type { Role } from "../../types/role-types";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  role: Role;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
}

export const userApi = {
  getProfileService: async (): Promise<UserProfile> => {
    const response = await ProTimeBackend.get("/user/profile");
    return response.data.data;
  },
  updateProfileService: async (
    data: UpdateUserProfileRequest
  ): Promise<UserProfile> => {
    const response = await ProTimeBackend.put("/user/profile", data);
    return response.data.data;
  },
};