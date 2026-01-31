import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../services/user/userService";

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: userApi.getProfileService,
    retry: false,
  });
};