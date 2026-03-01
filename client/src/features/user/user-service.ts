import { ProTimeBackend } from "../../api/instance";

// Matches backend UserProfileResponseDTO exactly
export interface UserProfile {
  id: string;
  fullName: string;       // ✅ backend returns fullName
  email: string;
  bio?: string;
  country?: string;       // ✅ backend has country, not location
  profileImage?: string;
  createdAt: string;
}

// Matches backend UpdateProfileRequestDTO exactly
export interface UpdateUserProfileRequest {
  fullName?: string;      // ✅ backend DTO uses fullname (lowercase)
  username?: string;
  bio?: string;
  country?: string;
  profileImage?: string;
}

export const userApi = {
  // GET /user/profile → returns UserProfile
  getProfileService: async (): Promise<UserProfile> => {
    const response = await ProTimeBackend.get("/user/profile");
    return response.data.data;
  },

  // PUT /user/profile → returns updated UserProfile
  updateProfileService: async (
    data: UpdateUserProfileRequest
  ): Promise<UserProfile> => {
    const response = await ProTimeBackend.put("/user/profile", data);
    return response.data.data;
  },

  // POST /user/upload/profile-image → returns image URL
  uploadProfileImage: async (_file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("profileImage", _file);
    const response = await ProTimeBackend.post("/user/upload/profile-image", formData);
    return response.data.data;
  }
};