import { ProTimeBackend } from "../../api/instance";

// Matches backend UserProfileResponseDTO exactly
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  country?: string;
  profileImage?: string;
  createdAt: string;
}

// Matches backend UpdateProfileRequestDTO exactly
export interface UpdateUserProfileRequest {
  fullName?: string;
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

  // PATCH /user/profile/avatar → returns { profileImage: string }
  // Field name must be 'avatar' — matches multer upload.single('avatar')
  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await ProTimeBackend.patch("/user/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.profileImage;
  },
};