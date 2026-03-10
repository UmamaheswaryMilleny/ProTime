import { useEffect } from 'react';
import { ProTimeBackend } from '../api/instance';
import { API_ROUTES } from '../config/env';
import { useAppSelector } from '../store/hooks';

const POLL_INTERVAL_MS = 60_000; // check every minute

/**
 * Polls the server to detect if the current user has been blocked by an admin.
 * Only runs if the user is authenticated and has the 'CLIENT' role.
 */
export const useBlockedUserPoll = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Skip for admins or unauthenticated users
        if (!isAuthenticated || !user || user.role === 'ADMIN') return;

        const check = async () => {
            try {
                await ProTimeBackend.get(API_ROUTES.USER_PROFILE);
            } catch {
                // Interceptor handles the rest
            }
        };

        check();
        const id = setInterval(check, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [isAuthenticated, user]);
};
