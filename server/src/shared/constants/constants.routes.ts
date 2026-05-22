export const ROUTES = {
  // Base paths used in server.ts
  BASE: {
    AUTH: '/api/v1/auth',
    ADMIN: '/api/v1/admin',
    USER: '/api/v1/user',
    TODO: '/api/v1/todos',
    SUBSCRIPTION: '/api/v1/subscription',
    GAMIFICATION: '/api/v1/gamification',
    BUDDY: '/api/v1/buddy',
    UTILITY: '/api/v1/utility',
    COMMUNITY_CHAT: '/api/v1/community-chat',
    CHAT: '/api/v1/chat',
    REPORTS: '/api/v1/reports', 
    ROOMS: '/api/v1/rooms',
    PROBUDDY: '/api/v1/probuddy',
  },

  // Auth Routes
  AUTH: {
    REGISTER: '/register',
    SEND_OTP: '/send-otp',
    RESEND_OTP: '/resend-otp',
    VERIFY_OTP: '/verify-otp',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_RESET_TOKEN: '/verify-reset-token',
    RESET_PASSWORD: '/reset-password',
    GOOGLE: '/google',
  },

  // Report Routes — user side
  REPORTS: {
    ROOT:               '/',                     // POST /api/v1/reports   (complaint)
    PRODUCTIVITY:       '/productivity',         // GET  /api/v1/reports/productivity
    PRODUCTIVITY_EXPORT:'/productivity/export',  // GET  /api/v1/reports/productivity/export
  },
  // Admin Routes
  ADMIN: {
    USERS: '/users',
    BLOCK_USER: '/users/:userId/block',
    UNBLOCK_USER: '/users/:userId/unblock',
    REPORTS:        '/reports',                      // ← add
    REPORT_BY_ID:   '/reports/:reportId',            // ← add
    RESOLVE_REPORT: '/reports/:reportId/resolve',    // ← add
    SUBSCRIPTIONS:  '/subscriptions',
    SUBSCRIPTION_STATS: '/subscriptions/stats',
    SUBSCRIPTION_BY_USER_ID: '/subscriptions/:userId',
    SUBSCRIPTION_ADD: '/subscriptions/add',
    GAMIFICATION_OVERVIEW: '/gamification/overview',
    GAMIFICATION_USERS: '/gamification/users',
    GAMIFICATION_USER_DETAIL: '/gamification/users/:userId',
    GAMIFICATION_LEADERBOARD: '/gamification/leaderboard',
    GAMIFICATION_BADGES: '/gamification/badges',
    GAMIFICATION_BADGE_TOGGLE: '/gamification/badges/:badgeId/toggle',
    DASHBOARD_STATS: '/dashboard/stats',
    MEETINGS:         '/meetings',
    MEETING_FORCE_CLOSE: '/meetings/:meetingId/force-close',
    SKILLS: '/skills',
    SKILL_BY_ID: '/skills/:skillId',
    SKILL_TOGGLE: '/skills/:skillId/toggle',
  },

  // User Routes
  USER: {
    PROFILE: '/profile',
    AVATAR: '/profile/avatar',
    SKILLS: '/skills',
  },

  // Todo Routes
  TODO: {
    ROOT: '/',
    BY_ID: '/:todoId',
    COMPLETE: '/:todoId/complete',
    POMODORO_COMPLETE: '/:todoId/pomodoro/complete',
  },

  // Subscription Routes
  SUBSCRIPTION: {
    WEBHOOK: '/webhook',
    ME: '/me',
    CHECKOUT: '/checkout',
    CANCEL: '/cancel',
  },

  // Gamification Routes
  GAMIFICATION: {
    ROOT: '/',
    LEADERBOARD: '/leaderboard',
  },

  // Buddy Routes
  BUDDY: {
    PREFERENCE: '/preference',
    MATCHES: '/matches',
    LIST: '/list',
    REQUESTS_PENDING: '/requests/pending',
    REQUESTS_SENT: '/requests/sent',
    SEND_REQUEST: '/request/:buddyId',
    RESPOND_REQUEST: '/request/:connectionId/respond',
    RATE: '/rate', // New endpoint for rating after a call
  },

  // Utility Routes
  UTILITY: {
    LOCATION: '/location',
  },

  // Community Chat Routes
  COMMUNITY_CHAT: {
    ROOT: '/',
  },

  ROOMS: {
    ROOT: '/',
    MY: '/my',
    LIMIT_CHECK: '/limit-check',
    BY_ID: '/:roomId',
    JOIN: '/:roomId/join',
    REQUEST: '/:roomId/request',
    REQUESTS: '/:roomId/join-requests/pending',
    ALL_REQUESTS: '/requests/all',
    RESPOND_REQUEST: '/join-requests/:requestId/respond',
    LEAVE: '/:roomId/leave',
    KICK: '/:roomId/kick',
    INVITE: '/:roomId/invite',
    END: '/:roomId/end',
    START: '/:roomId/start',
    MESSAGES: '/:roomId/messages',
    SEND_MESSAGE: '/:roomId/messages',
  },

  CHAT: {
    CONVERSATIONS: '/',
    MESSAGES: '/:conversationId/messages',
    SEND_MESSAGE: '/:conversationId/messages',
    MARK_AS_READ: '/:conversationId/read',
    START_SESSION: '/:conversationId/session/start',
    END_SESSION: '/:conversationId/session/end',
    DELETE_CHAT: '/:conversationId/messages',
    UPLOAD: '/upload',
  },

};
