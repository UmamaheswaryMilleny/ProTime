// import { ProTimeBackend } from "../../api/instance";
// // Matches backend UserProfileResponseDTO exactly
// export interface UserProfile {
//   id: string;
//   fullName: string;       // ✅ backend returns fullName
//   email: string;
//   bio?: string;
//   country?: string;       // ✅ backend has country, not location
//   profileImage?: string;
//   createdAt: string;
// }

// import type { AxiosResponse } from "axios";

// // ⚠️ NOTE: Backend endpoint /user/upload/profile-image does not exist yet.
// // This service is ready but cannot be used until that route is built.
// // For now, profile image updates should pass a URL string via updateProfileService.

// export const userUploadApi = {
//   uploadProfileImage: async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append("image", file);

//     const response: AxiosResponse<{
//       success: boolean;
//       data: { url: string };
//     }> = await ProTimeBackend.post("/user/upload/profile-image", formData);

//     return response.data.data.url;
//   },
// };
// // Matches backend UpdateProfileRequestDTO exactly
// export interface UpdateUserProfileRequest {
//   fullname?: string;      // ✅ backend DTO uses fullname (lowercase)
//   username?: string;
//   bio?: string;
//   country?: string;
//   profileImage?: string;
// }

// export const userApi = {
//   // GET /user/profile → returns UserProfile
//   getProfileService: async (): Promise<UserProfile> => {
//     const response = await ProTimeBackend.get("/user/profile");
//     return response.data.data;
//   },

//   // PUT /user/profile → returns updated UserProfile
//   updateProfileService: async (
//     data: UpdateUserProfileRequest
//   ): Promise<UserProfile> => {
//     const response = await ProTimeBackend.put("/user/profile", data);
//     return response.data.data;
//   },
// };