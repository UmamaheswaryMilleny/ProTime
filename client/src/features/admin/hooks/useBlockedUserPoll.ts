import { useEffect } from 'react';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../config/env';

const POLL_INTERVAL_MS = 30_000; // check every 30 seconds

/**
 * Polls the server every 30 seconds to detect if the current user has been
 * blocked by an admin. When the server returns 403 "blocked", the global
 * Axios response interceptor in instance.ts handles clearing auth state
 * and redirecting to /login automatically.
 *
 * Should only be mounted for authenticated CLIENT users (not admins).
 */
export const useBlockedUserPoll = () => {
    useEffect(() => {
        const check = async () => {
            try {
                await ProTimeBackend.get(API_ROUTES.USER_PROFILE);
            } catch {
                // Errors (including 403 "blocked") are handled by the Axios interceptor.
                // No action needed here.
            }
        };

        // Run immediately on mount, then on interval
        check();
        const id = setInterval(check, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);
};
