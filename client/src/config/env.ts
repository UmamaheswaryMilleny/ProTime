export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string, // ← added
};

export const ROUTES = {
  // ─── Public ───────────────────────────────────────────────────────────────
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // ─── User Dashboard ───────────────────────────────────────────────────────
  DASHBOARD: "/dashboard",                              // main dashboard home
  USER_PROFILE: "/dashboard/profile",                  // profile tab (inside dashboard)
  DASHBOARD_FIND_BUDDY: "/dashboard/find-buddy",
  DASHBOARD_TODO_LIST: "/dashboard/todo-list",
  DASHBOARD_HELP: "/dashboard/help",
  DASHBOARD_LEVELS: "/dashboard/levels",
  DASHBOARD_SUBSCRIPTION: "/dashboard/subscription",

  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
} as const;

export const API_ROUTES = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  SEND_OTP: "/auth/send-otp",
  RESEND_OTP: "/auth/resend-otp",
  VERIFY_OTP: "/auth/verify-otp",
  REFRESH_TOKEN: "/auth/refresh-token",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_RESET_TOKEN: "/auth/verify-reset-token",
  RESET_PASSWORD: "/auth/reset-password",
  GOOGLE_AUTH: "/auth/google",
  USER_PROFILE: "/user/profile",
  ADMIN_USERS: "/admin/users",
  ADMIN_BLOCK_USER: (id: string) => `/admin/users/${id}/block`,
  ADMIN_UNBLOCK_USER: (id: string) => `/admin/users/${id}/unblock`,
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;