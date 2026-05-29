import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
    | 'buddy_request'
    | 'buddy_accepted'
    | 'task_expired'
    | 'xp_gained'
    | 'level_up'
    | 'task_completed'
    | 'premium_purchased'
    | 'schedule_accepted'
    | 'schedule_requested'
    | 'session_reminder'
    | 'chat_message'
    | 'missed_call'
    | 'study_room_invite'
    | 'study_room_request'
    | 'study_room_start'
    | 'subscription_expiring'
    | 'subscription_expired'
    | 'subscription_cancelled'
    | 'admin_warning';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string; // ISO string
    isRead: boolean;
    readAt?: string | null; // ISO string when marked as read
    metadata?: Record<string, unknown>;
}

interface NotificationState {
    notifications: Notification[];
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

/**
 * Returns a user-scoped storage key so notifications from one account
 * can never leak into another account's session.
 */
function storageKey(userId?: string): string {
    return userId ? `protime_notifications_${userId}` : 'protime_notifications_guest';
}

const MAX_STORED = 50; // keep at most 50 most recent

/** Resolves userId from persisted auth session (no Redux dependency needed here) */
function currentUserId(): string | undefined {
    try {
        const session = localStorage.getItem('authSession');
        return session ? (JSON.parse(session) as { id?: string }).id : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Reads the current user's notifications from localStorage.
 * Scoped by userId so notifications never bleed between accounts.
 */
function load(): Notification[] {
    try {
        const userId = currentUserId();
        const raw = localStorage.getItem(storageKey(userId));
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Notification[];

        // Deduplicate existing entries
        const seen = new Set<string>();
        const unique: Notification[] = [];
        for (const n of parsed) {
            const taskId = n.metadata?.taskId as string | undefined;
            const key = taskId ? `task-${taskId}` : `${n.type}-${n.message}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(n);
            }
        }
        return unique;
    } catch {
        return [];
    }
}

function save(notifications: Notification[], userId?: string): void {
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(notifications.slice(0, MAX_STORED)));
    } catch {
        // quota exceeded — silently ignore
    }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: NotificationState = {
    notifications: load(),
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'isRead'>>) => {
            // Deduplicate new entries
            const isDuplicate = state.notifications.some(n => {
                const actionTaskId = action.payload.metadata?.taskId as string | undefined;
                const nTaskId = n.metadata?.taskId as string | undefined;
                if (actionTaskId && nTaskId && actionTaskId === nTaskId) {
                    return true;
                }
                return n.type === action.payload.type && n.message === action.payload.message;
            });

            if (isDuplicate) {
                return;
            }

            const notification: Notification = {
                ...action.payload,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                timestamp: new Date().toISOString(),
                isRead: false,
                readAt: null,
            };
            state.notifications.unshift(notification);
            // Keep only MAX_STORED
            if (state.notifications.length > MAX_STORED) {
                state.notifications = state.notifications.slice(0, MAX_STORED);
            }
            save(state.notifications, currentUserId());
        },

        markAsRead: (state, action: PayloadAction<string>) => {
            const n = state.notifications.find(n => n.id === action.payload);
            if (n && !n.isRead) {
                n.isRead = true;
                n.readAt = new Date().toISOString();
            }
            save(state.notifications, currentUserId());
        },

        markAllAsRead: (state) => {
            const now = new Date().toISOString();
            state.notifications.forEach(n => {
                if (!n.isRead) {
                    n.isRead = true;
                    n.readAt = now;
                }
            });
            save(state.notifications, currentUserId());
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
            save(state.notifications, currentUserId());
        },

        clearAll: (state) => {
            state.notifications = [];
            save(state.notifications, currentUserId());
        },

        /**
         * clearForLogout — called on every logout.
         * Clears in-memory Redux state so the next user starts with an empty list.
         * Does NOT delete the user-scoped localStorage key — the same user gets
         * their notifications back if they log in again.
         */
        clearForLogout: (state) => {
            state.notifications = [];
        },

        /**
         * loadForUser — call after login to load notifications scoped to the new user.
         * Required for account-switching without a full page reload.
         */
        loadForUser: (state, action: PayloadAction<string>) => {
            try {
                const raw = localStorage.getItem(storageKey(action.payload));
                if (!raw) {
                    state.notifications = [];
                    return;
                }
                const parsed = JSON.parse(raw) as Notification[];
                const seen = new Set<string>();
                const unique: Notification[] = [];
                for (const n of parsed) {
                    const taskId = n.metadata?.taskId as string | undefined;
                    const key = taskId ? `task-${taskId}` : `${n.type}-${n.message}`;
                    if (!seen.has(key)) { seen.add(key); unique.push(n); }
                }
                state.notifications = unique;
            } catch {
                state.notifications = [];
            }
        },

        purgeOldNotifications: (state) => {
            const TEN_MINUTES = 10 * 60 * 1000;
            const now = Date.now();
            const originalLength = state.notifications.length;

            state.notifications = state.notifications.filter(n => {
                if (!n.isRead || !n.readAt) return true;
                const readAtTime = new Date(n.readAt).getTime();
                return now - readAtTime < TEN_MINUTES;
            });

            if (state.notifications.length !== originalLength) {
                save(state.notifications, currentUserId());
            }
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearForLogout,
    loadForUser,
    purgeOldNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
