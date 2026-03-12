export const CLIENT_ROUTES = {
    // ─── Public ───────────────────────────────────────────────────────────────
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // ─── User Dashboard ───────────────────────────────────────────────────────
    DASHBOARD: "/dashboard",
    USER_PROFILE: "/dashboard/profile",
    DASHBOARD_FIND_BUDDY: "/dashboard/find-buddy",
    DASHBOARD_TODO_LIST: "/dashboard/todo-list",
    DASHBOARD_HELP: "/dashboard/help",
    DASHBOARD_LEVELS: "/dashboard/levels",
    DASHBOARD_SUBSCRIPTION: "/dashboard/subscription",
    DASHBOARD_SUBSCRIPTION_PLAN: "/dashboard/subscription/plan",
    DASHBOARD_SUBSCRIPTION_PAYMENT: "/dashboard/subscription/payment",

    // ─── Admin ────────────────────────────────────────────────────────────────
    ADMIN_LOGIN: "/admin/login",
    ADMIN_DASHBOARD: "/admin/dashboard",
    ADMIN_USERS: "/admin/users",
} as const;

export const API_ROUTES = {
    AUTH: {
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
    },
    USER: {
        PROFILE: "/user/profile",
        AVATAR: "/user/profile/avatar",
    },
    TODO: {
        BASE: "/todos",
    },
    SUBSCRIPTION: {
        ME: "/subscription/me",
        CHECKOUT: "/subscription/checkout",
        CANCEL: "/subscription/cancel",
    },
    GAMIFICATION: {
        BASE: "/gamification",
    },
    ADMIN: {
        USERS: "/admin/users",
        BLOCK_USER: (id: string) => `/admin/users/${id}/block`,
        UNBLOCK_USER: (id: string) => `/admin/users/${id}/unblock`,
    },
} as const;
