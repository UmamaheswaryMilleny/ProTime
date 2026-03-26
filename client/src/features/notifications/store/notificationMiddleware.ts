import type { Middleware } from '@reduxjs/toolkit';
import { loginUser, updateUser } from '../../auth/store/authSlice';
import { addNotification } from './notificationSlice';

/**
 * Watches auth actions and dispatches a premium_purchased notification
 * when isPremium transitions false → true.
 *
 * We keep track of the previous isPremium value via closure.
 */
export const notificationMiddleware: Middleware = (storeAPI) => (next) => (action) => {
    const prevIsPremium = (storeAPI.getState() as any).auth.user?.isPremium ?? false;

    const result = next(action);

    if (loginUser.match(action) || updateUser.match(action)) {
        const nextIsPremium = (storeAPI.getState() as any).auth.user?.isPremium ?? false;

        if (!prevIsPremium && nextIsPremium) {
            storeAPI.dispatch(
                addNotification({
                    type: 'premium_purchased',
                    title: '💎 Welcome to Premium!',
                    message: 'You now have unlimited buddy connections and exclusive features.',
                    metadata: {},
                })
            );
        }
    }

    return result;
};
