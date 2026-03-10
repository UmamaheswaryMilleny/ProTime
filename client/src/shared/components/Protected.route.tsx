import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { ROUTES } from "../../config/env";
import { useBlockedUserPoll } from "../../hooks/useBlockedUserPoll";

interface ProtectedRouteProps {
  allowedRole: "ADMIN" | "CLIENT";
}

/**
 * ProtectedRoute — blocks access based on auth state and role.
 * For CLIENT users, polls the server every 30s to detect if the admin
 * has blocked them — triggers auto-logout via the Axios interceptor on 403.
 */
export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Poll server every 30s to detect block (CLIENT users only)
  useBlockedUserPoll();

  const redirectPath = allowedRole === "ADMIN" ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};