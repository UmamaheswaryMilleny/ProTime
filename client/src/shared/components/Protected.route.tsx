import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { ROUTES } from "../../config/env";

interface ProtectedRouteProps {
  allowedRole: "ADMIN" | "CLIENT";
}

/**
 * ProtectedRoute — blocks access based on auth state and role
 *
 * If not authenticated → redirect to /login
 * If authenticated but wrong role → redirect to /login
 * If authenticated and correct role → render children via <Outlet />
 */

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};