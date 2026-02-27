import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { ROUTES } from "../../config/env";

/**
 * PublicRoute — prevents logged-in users from accessing auth pages
 *
 * If authenticated as CLIENT → redirect to /user/profile
 * If authenticated as ADMIN → redirect to /admin/dashboard
 * If not authenticated → render children via <Outlet />
 */
export const PublicRoute = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    if (user.role === "ADMIN") {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};