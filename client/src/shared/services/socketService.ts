import { io, Socket } from 'socket.io-client';
import { store } from '../../store/store';
import { addMessage, type CommunityMessage } from '../../features/community-chat/store/communitySlice';
import { addNotification } from '../../features/notifications/store/notificationSlice';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
        
        this.socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to server');
        });

        this.socket.on('new_community_message', (message: CommunityMessage) => {
            store.dispatch(addMessage(message));
        });

        // ─── Notification Events ───────────────────────────────────────────────

        this.socket.on('notification:buddy_request', (data: { fromUserName: string; fromUserId: string }) => {
            store.dispatch(addNotification({
                type: 'buddy_request',
                title: '🤝 New Buddy Request',
                message: `${data.fromUserName} wants to be your study buddy!`,
                metadata: { fromUserId: data.fromUserId, fromUserName: data.fromUserName },
            }));
        });

        this.socket.on('notification:buddy_accepted', (data: { byUserName: string; byUserId: string }) => {
            store.dispatch(addNotification({
                type: 'buddy_accepted',
                title: '✅ Buddy Request Accepted',
                message: `${data.byUserName} accepted your buddy request!`,
                metadata: { byUserId: data.byUserId, byUserName: data.byUserName },
            }));
        });

        this.socket.on('notification:schedule_accepted', (data: { message: string }) => {
            store.dispatch(addNotification({
                type: 'schedule_accepted',
                title: '📅 Schedule Accepted',
                message: data.message,
            }));
        });

        this.socket.on('notification:new', (notification: any) => {
            store.dispatch(addNotification(notification));
        });

        // ──────────────────────────────────────────────────────────────────────

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data: unknown) {
        this.socket?.emit(event, data);
    }

    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }
}

export const socketService = new SocketService();

