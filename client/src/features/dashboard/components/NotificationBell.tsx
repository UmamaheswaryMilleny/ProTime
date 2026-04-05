import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    markAllAsRead,
    removeNotification,
    markAsRead,
    clearAll,
    purgeOldNotifications,
    type Notification,
    type NotificationType,
} from '../../notifications/store/notificationSlice';

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { emoji: string; color: string; bg: string; border: string }> = {
    buddy_request:    { emoji: '🤝', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    buddy_accepted:   { emoji: '✅', color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
    task_expired:     { emoji: '⏰', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    xp_gained:        { emoji: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    level_up:         { emoji: '🎉', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    task_completed:   { emoji: '🏆', color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20' },
    premium_purchased:{ emoji: '💎', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    schedule_accepted:{ emoji: '📅', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    schedule_requested:{ emoji: '📩', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    session_reminder: { emoji: '⏳', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    chat_message:     { emoji: '💬', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    missed_call:      { emoji: '📹', color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20' },
    study_room_invite:{ emoji: '📚', color: 'text-[blueviolet]', bg: 'bg-[blueviolet]/10', border: 'border-[blueviolet]/20' },
    study_room_request:{ emoji: '🙋', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    subscription_expiring: { emoji: '⚠️', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    subscription_expired:  { emoji: '❌', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    subscription_cancelled:{ emoji: '💎', color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   border: 'border-zinc-500/20' },
    admin_warning:    { emoji: '⚠️', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationBell: React.FC = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector((state) => state.notifications.notifications);
    const [isOpen, setIsOpen] = useState(false);
    
    // Type-safe purge (dispatch expects specific thunk/action type)
    const typeCastPurge = purgeOldNotifications as any;
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Periodic cleanup of old notifications (deleted 10 mins after being read)
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(typeCastPurge());
        }, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleOpen = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    const handleDismiss = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch(removeNotification(id));
    };

    const navigate = useNavigate();

    const handleClickNotification = (n: Notification) => {
        if (!n.isRead) dispatch(markAsRead(n.id));

        // Navigation logic based on type
        if (n.type === 'study_room_invite' || n.type === 'study_room_request') {
            navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
            setIsOpen(false);
        } else if (n.type === 'buddy_request' || n.type === 'buddy_accepted') {
            navigate(ROUTES.DASHBOARD_FIND_BUDDY);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all relative group"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-zinc-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 mt-3 w-[340px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden fade-in">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-800/60">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {notifications.length > 0 && (
                                <>
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => dispatch(clearAll())}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Clear all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-white/5">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-zinc-600" />
                                </div>
                                <p className="text-zinc-400 text-sm font-medium">No notifications</p>
                                <p className="text-zinc-600 text-xs mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const cfg = TYPE_CONFIG[n.type];
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleClickNotification(n)}
                                        className={`relative flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-white/5 ${!n.isRead ? 'bg-white/[0.03]' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${cfg.bg} border ${cfg.border}`}>
                                            {cfg.emoji}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold leading-tight ${cfg.color}`}>{n.title}</p>
                                                {!n.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 mt-1 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">{timeAgo(n.timestamp)}</p>
                                        </div>

                                        {/* Dismiss */}
                                        <button
                                            onClick={(e) => handleDismiss(e, n.id)}
                                            className="flex-shrink-0 p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                            title="Dismiss"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 bg-zinc-800/30 border-t border-white/5 text-center">
                            <p className="text-[10px] text-zinc-600 font-medium">
                                Click a notification to mark it as read
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

