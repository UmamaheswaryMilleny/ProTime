import type { RootState } from "../store/store";
import type { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../config/env";
import type { Role } from "../types/role-types";

interface NoAuthRouteProps {
  element: JSX.Element;
}

export const NoAuthRoute = ({ element }: NoAuthRouteProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  
  if (!user) {
    return element;
  }

  //  redirection  for logged-in users
  const roleRedirectMap: Record<Role, string> = {
    admin: ROUTES.ADMIN_DASHBOARD,
    client: ROUTES.CLIENT_DASHBOARD,

  };

  return <Navigate to={roleRedirectMap[user.role]} replace />;
};