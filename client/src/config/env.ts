export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/signup",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  CLIENT_DASHBOARD: "/client/dashboard",
    CLIENT_PROFILE: "/client/profile",

};

export const AUTH_CONFIG = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
    ME: "/auth/me",
  PROFILE: "/auth/profile",
  ADMIN_LOGIN:"/auth/admin/login",
};

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

// type Role = "admin" | "client";
export type Role = (typeof ROLES)[keyof typeof ROLES];