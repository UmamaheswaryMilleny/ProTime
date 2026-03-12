export const API_V1_BASE = '/api/v1';

export const ROUTES = {
    AUTH: {
        BASE: '/auth',
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
    ADMIN: {
        BASE: '/admin',
        USERS: '/users',
        BLOCK_USER: '/users/:userId/block',
        UNBLOCK_USER: '/users/:userId/unblock',
    },
    USER: {
        BASE: '/user',
        PROFILE: '/profile',
        AVATAR: '/profile/avatar',
    },
    TODO: {
        BASE: '/todos',
        ROOT: '/',
        COMPLETE: '/:todoId/complete',
        POMODORO_COMPLETE: '/:todoId/pomodoro/complete',
        BY_ID: '/:todoId',
    },
    SUBSCRIPTION: {
        BASE: '/subscription',
        ME: '/me',
        CHECKOUT: '/checkout',
        CANCEL: '/cancel',
        WEBHOOK: '/webhook',
    },
    GAMIFICATION: {
        BASE: '/gamification',
        ROOT: '/',
    },
} as const;
