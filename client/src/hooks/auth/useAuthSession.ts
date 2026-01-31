import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { User } from "../../types/auth-types";
import { authApi } from "../../services/auth/authService";
import { loginUser, logoutUser } from "../../store/slices/userSlice";

const readStoredSession = (): User | null => {
  try {
    const stored = localStorage.getItem("authSession");
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

/**
 * Centralized, server-validated session hook.
 *
 * - If there's no local session, we don't call the server.
 * - If there is a local session, we call GET /auth/me to validate tokens/cookies.
 *   - success: we sync Redux/localStorage user data with the server response
 *   - failure: we clear auth state so auth pages become accessible again
 */
export const useAuthSession = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const localUser = reduxUser ?? readStoredSession();
  const shouldValidate = !!localUser;

  const query = useQuery({
    queryKey: ["authMe"],
    queryFn: authApi.me,
    enabled: shouldValidate,
    retry: false,
    staleTime: 60 * 1000, // keep it light; refresh/back won't spam
  });

  // Sync on success / clear on failure (side effects)
  useEffect(() => {
    if (!shouldValidate) return;

    if (query.isSuccess && query.data) {
      dispatch(loginUser(query.data));
      return;
    }

    if (query.isError) {
      dispatch(logoutUser());
    }
  }, [dispatch, query.data, query.isError, query.isSuccess, shouldValidate]);

  return {
    user: reduxUser ?? localUser,
    isValidating: shouldValidate && query.isLoading,
    isAuthenticated: !!(reduxUser ?? localUser) && !query.isError,
  };
};

