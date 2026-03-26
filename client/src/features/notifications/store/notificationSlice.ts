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
    | 'session_reminder';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string; // ISO string
    isRead: boolean;
    metadata?: Record<string, unknown>;
}

interface NotificationState {
    notifications: Notification[];
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'protime_notifications';
const MAX_STORED = 50; // keep at most 50 most recent

function load(): Notification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Notification[]) : [];
    } catch {
        return [];
    }
}

function save(notifications: Notification[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
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
            const notification: Notification = {
                ...action.payload,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                timestamp: new Date().toISOString(),
                isRead: false,
            };
            state.notifications.unshift(notification);
            // Keep only MAX_STORED
            if (state.notifications.length > MAX_STORED) {
                state.notifications = state.notifications.slice(0, MAX_STORED);
            }
            save(state.notifications);
        },

        markAsRead: (state, action: PayloadAction<string>) => {
            const n = state.notifications.find(n => n.id === action.payload);
            if (n) n.isRead = true;
            save(state.notifications);
        },

        markAllAsRead: (state) => {
            state.notifications.forEach(n => { n.isRead = true; });
            save(state.notifications);
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
            save(state.notifications);
        },

        clearAll: (state) => {
            state.notifications = [];
            save(state.notifications);
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
} = notificationSlice.actions;

export default notificationSlice.reducer;
