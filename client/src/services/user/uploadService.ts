import { ProTimeBackend } from "../../api/instance";
import type { AxiosResponse } from "axios";

export const userUploadApi = {
  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response: AxiosResponse<{
      success: boolean;
      data: { url: string };
    }> = await ProTimeBackend.post("/user/upload/profile-image", formData);

    return response.data.data.url; // return image URL
  },
};
