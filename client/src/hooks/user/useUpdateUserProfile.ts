import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../services/user/userService";
import type { UpdateUserProfileRequest } from "../../services/user/userService";
import toast from "react-hot-toast";

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      userApi.updateProfileService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });
};