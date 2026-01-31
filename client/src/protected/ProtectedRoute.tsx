import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../config/env";
import type { Role } from "../types/role-types";
import { useAuthSession } from "../hooks/auth/useAuthSession";

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: Role[];
}

export const ProtectedRoute = ({
  element,
  allowedRoles,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user: currentUser, isValidating, isAuthenticated } = useAuthSession();

  if (isValidating) return null;

  //if not logged in the user
  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

//role based access
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return element;
};