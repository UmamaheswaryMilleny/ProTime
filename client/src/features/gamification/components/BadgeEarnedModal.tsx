import React, { useEffect, useState } from 'react';
import { X, Sparkles, Trophy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { clearBadgeNotification } from '../store/gamificationSlice';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserBadge } from '../types/gamification.types';

export const BadgeEarnedModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(state => state.gamification.pendingBadgeNotifications);
    const [currentBadge, setCurrentBadge] = useState<UserBadge | null>(notifications[0] || null);

    useEffect(() => {
        if (notifications.length > 0 && !currentBadge) {
            setCurrentBadge(notifications[0]);
        }
    }, [notifications, currentBadge]);

    const handleClose = () => {
        if (currentBadge) {
            dispatch(clearBadgeNotification(currentBadge.id));
            setCurrentBadge(null);
        }
    };

    if (!currentBadge) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
                >
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex flex-col items-center text-center pt-2">
                        {/* Elegant Trophy Circle */}
                        <div className="w-20 h-20 mb-5 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/5">
                            <Trophy size={36} className="text-yellow-500" />
                        </div>

                        {/* Minimal Achievement Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                            <Sparkles size={12} className="animate-pulse" />
                            New Achievement
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {currentBadge.name}
                        </h2>

                        {/* Description */}
                        <p className="text-zinc-400 text-sm mb-6 max-w-[280px] leading-relaxed">
                            {currentBadge.description}
                        </p>

                        {/* Clean Action Button */}
                        <button 
                            onClick={handleClose}
                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-semibold rounded-xl transition-all active:scale-[0.98] text-sm tracking-wide"
                        >
                            That's Awesome!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
