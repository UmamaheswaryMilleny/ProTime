import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// usequery-getdat, usemutation-postMessage,put,delete, acessmanager - usequeryclient
import { adminApi, type GetUsersParams } from "../../services/admin/adminService";
import toast from "react-hot-toast";


// Get Users List Hook
export const useAdminUsers = (params: GetUsersParams) => {
  return useQuery({
    queryKey: [
      "adminUsers",
      params.page,
      params.limit,
      params.search,
      params.status,
      params.sort,
      params.order,
    ],
    queryFn: () => adminApi.getUsers(params),
  });
};

export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return adminApi.getUserDetails(userId);
    },
    enabled: !!userId,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User blocked successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to block user";
      toast.error(errorMessage);
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User unblocked successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to unblock user";
      toast.error(errorMessage);
    },
  });
};



