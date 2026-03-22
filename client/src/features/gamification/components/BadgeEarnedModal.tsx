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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-yellow-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden"
                >
                    {/* Background Glows */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div 
                            initial={{ rotate: -10, scale: 0.5 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-32 h-32 mb-6 rounded-3xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/40 relative group"
                        >
                            <Trophy size={64} className="text-zinc-900 drop-shadow-lg" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-4 border-2 border-yellow-500/30 rounded-[40px]"
                            />
                        </motion.div>

                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                            <span className="text-yellow-500 font-bold text-sm tracking-widest uppercase">New Achievement</span>
                            <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-3">
                            {currentBadge.name}
                        </h2>

                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                            {currentBadge.description}
                        </p>

                        <button 
                            onClick={handleClose}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-900 font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20 uppercase tracking-widest text-sm"
                        >
                            That's Awesome!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
