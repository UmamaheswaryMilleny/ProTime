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
  DASHBOARD_MY_BUDDIES: "/dashboard/my-buddies",
  DASHBOARD_BUDDY_REQUESTS: "/dashboard/buddy-requests",
  DASHBOARD_TODO_LIST: "/dashboard/todo-list",
  DASHBOARD_HELP: "/dashboard/help",
  DASHBOARD_LEVELS: "/dashboard/levels",
  DASHBOARD_SUBSCRIPTION: "/dashboard/subscription",
  DASHBOARD_SUBSCRIPTION_PLAN: "/dashboard/subscription/plan",
  DASHBOARD_SUBSCRIPTION_PAYMENT: "/dashboard/subscription/payment",
  DASHBOARD_COMMUNITY_CHAT: "/dashboard/community-chat",
  DASHBOARD_CHAT: "/dashboard/chat",
  DASHBOARD_CHAT_CONVERSATION: "/dashboard/chat/:conversationId",

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

  // ─── User ─────────────────────────────────────────────────────────────────
  USER_PROFILE: "/user/profile",
  USER_AVATAR:  "/user/profile/avatar",

  // ─── Todo ─────────────────────────────────────────────────────────────────
  TODO_ROOT:             "/todos",
  TODO_BY_ID:            (id: string) => `/todos/${id}`,
  TODO_COMPLETE:         (id: string) => `/todos/${id}/complete`,
  TODO_POMODORO_COMPLETE:(id: string) => `/todos/${id}/pomodoro/complete`,

  // ─── Gamification ─────────────────────────────────────────────────────────
  GAMIFICATION: "/gamification",

  // ─── Subscription ─────────────────────────────────────────────────────────
  SUBSCRIPTION:          "/subscription/me",
  SUBSCRIPTION_CHECKOUT: "/subscription/checkout",
  SUBSCRIPTION_CANCEL:   "/subscription/cancel",

  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN_USERS:        "/admin/users",
  ADMIN_BLOCK_USER:   (id: string) => `/admin/users/${id}/block`,
  ADMIN_UNBLOCK_USER: (id: string) => `/admin/users/${id}/unblock`,

  // ─── Buddy ────────────────────────────────────────────────────────────────
  BUDDY_PREFERENCE:       "/buddy/preference",
  BUDDY_MATCHES:          "/buddy/matches",
  BUDDY_LIST:             "/buddy/list",
  BUDDY_PENDING_REQUESTS: "/buddy/requests/pending",
  BUDDY_SENT_REQUESTS:    "/buddy/requests/sent",
  BUDDY_SEND_REQUEST:     (buddyId: string) => `/buddy/request/${buddyId}`,
  BUDDY_RESPOND_REQUEST:  (connectionId: string) => `/buddy/request/${connectionId}/respond`,

  // ─── Community Chat ───────────────────────────────────────────────────────
  COMMUNITY_CHAT: "/community-chat",

  // ─── Chat ─────────────────────────────────────────────────────────────────
  CHAT_CONVERSATIONS: "/chat",
  CHAT_MESSAGES:      (conversationId: string) => `/chat/${conversationId}/messages`,
  CHAT_READ:          (conversationId: string) => `/chat/${conversationId}/read`,
  CHAT_SESSION_START: (conversationId: string) => `/chat/${conversationId}/session/start`,
  CHAT_SESSION_END:   (conversationId: string) => `/chat/${conversationId}/session/end`,

  // ─── Utility ──────────────────────────────────────────────────────────────
  UTILITY_LOCATION: "/utility/location",
} as const;
