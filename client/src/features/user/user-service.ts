import { ProTimeBackend } from "../../api/instance";
import { API_ROUTES } from "../../shared/constants/constants.routes";

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
    const response = await ProTimeBackend.get(API_ROUTES.USER_PROFILE);
    return response.data.data;
  },

  // PUT /user/profile → returns updated UserProfile
  updateProfileService: async (
    data: UpdateUserProfileRequest
  ): Promise<UserProfile> => {
    const response = await ProTimeBackend.put(API_ROUTES.USER_PROFILE, data);
    return response.data.data;
  },

  // PATCH /user/profile/avatar → returns { profileImage: string }
  // Field name must be 'avatar' — matches multer upload.single('avatar')
  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await ProTimeBackend.patch(API_ROUTES.USER_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.profileImage;
  },
};