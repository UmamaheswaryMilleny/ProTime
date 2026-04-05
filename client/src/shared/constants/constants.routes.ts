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
  DASHBOARD_PROBUDDY: "/dashboard/probuddy",
  DASHBOARD_CALENDAR: "/dashboard/calendar",
  DASHBOARD_STUDY_ROOMS: "/dashboard/study-rooms",
  DASHBOARD_STUDY_ROOM: "/dashboard/study-rooms/:roomId",

  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_MEETINGS: "/admin/meetings",
  ADMIN_GAMIFICATION: "/admin/gamification",
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

  // ─── Reporting ────────────────────────────────────────────────────────────
  REPORT_SUBMIT: "/reports",

  // ─── Subscription ─────────────────────────────────────────────────────────
  SUBSCRIPTION:          "/subscription/me",
  SUBSCRIPTION_CHECKOUT: "/subscription/checkout",
  SUBSCRIPTION_CANCEL:   "/subscription/cancel",

  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN_USERS:        "/admin/users",
  ADMIN_BLOCK_USER:   (id: string) => `/admin/users/${id}/block`,
  ADMIN_UNBLOCK_USER: (id: string) => `/admin/users/${id}/unblock`,
  ADMIN_REPORTS:        "/admin/reports",
  ADMIN_RESOLVE_REPORT: (id: string) => `/admin/reports/${id}/resolve`,
  ADMIN_SUBSCRIPTIONS:  "/admin/subscriptions",
  ADMIN_SUBSCRIPTION_STATS: "/admin/subscriptions/stats",
  ADMIN_MEETINGS:           "/admin/meetings",
  ADMIN_MEETING_FORCE_CLOSE: (id: string) => `/admin/meetings/${id}/force-close`,
  ADMIN_GAMIFICATION_OVERVIEW: "/admin/gamification/overview",
  ADMIN_GAMIFICATION_USERS: "/admin/gamification/users",
  ADMIN_GAMIFICATION_USER_DETAIL: (userId: string) => `/admin/gamification/users/${userId}`,
  ADMIN_GAMIFICATION_LEADERBOARD: "/admin/gamification/leaderboard",
  ADMIN_GAMIFICATION_BADGES: "/admin/gamification/badges",
  ADMIN_GAMIFICATION_BADGE_TOGGLE: (badgeId: string) => `/admin/gamification/badges/${badgeId}/toggle`,

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
  CHAT_DELETE:        (conversationId: string) => `/chat/${conversationId}/messages`,
  
  CHAT_BUDDY_SESSION_START: (conversationId: string) => `/chat/${conversationId}/buddy-session/start`,
  CHAT_BUDDY_SESSION_END:   (conversationId: string) => `/chat/${conversationId}/buddy-session/end`,
  CHAT_BUDDY_SESSION_PROPOSE: (conversationId: string) => `/chat/${conversationId}/buddy-session/propose`,
  CHAT_BUDDY_SESSION_PROPOSE_RECURRING: (conversationId: string) => `/chat/${conversationId}/buddy-session/propose-recurring`,
  CHAT_UPLOAD:        "/chat/upload",


  // ─── Calendar ─────────────────────────────────────────────────────────────
  CALENDAR_EVENTS: "/calendar/events",
  CALENDAR_DAY:    (date: string) => `/calendar/day/${date}`,
  CALENDAR_REQUESTS: "/calendar/schedule-requests",
  CALENDAR_SOLO_EVENT: "/calendar/events/solo",
  CALENDAR_RESPOND_REQUEST: (requestId: string) => `/chat/schedule-requests/${requestId}/respond`,
  CALENDAR_SESSION_NOTES: (sessionId: string) => `/chat/sessions/${sessionId}/notes`,

  // ─── Study Rooms ───────────────────────────────────────────────────────────
  ROOMS:                   "/rooms",
  ROOMS_MY:                "/rooms/my",
  ROOMS_ALL_REQUESTS:      "/rooms/requests/all",
  ROOMS_BY_ID:             (roomId: string) => `/rooms/${roomId}`,
  ROOMS_JOIN:              (roomId: string) => `/rooms/${roomId}/join`,
  ROOMS_REQUEST:           (roomId: string) => `/rooms/${roomId}/request`,
  ROOMS_PENDING_REQUESTS:  (roomId: string) => `/rooms/${roomId}/join-requests/pending`,
  ROOMS_RESPOND_REQUEST:   (requestId: string) => `/rooms/join-requests/${requestId}/respond`,
  ROOMS_LEAVE:             (roomId: string) => `/rooms/${roomId}/leave`,
  ROOMS_END:               (roomId: string) => `/rooms/${roomId}/end`,
  ROOMS_START:             (roomId: string) => `/rooms/${roomId}/start`,
  ROOMS_MESSAGES:          (roomId: string) => `/rooms/${roomId}/messages`,

  // ─── ProBuddy ─────────────────────────────────────────────────────────────
  PROBUDDY_CHAT: "/probuddy/chat",

  // ─── Utility ──────────────────────────────────────────────────────────────
  UTILITY_LOCATION: "/utility/location",
} as const;
