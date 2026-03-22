import React from 'react';

import { useGamification } from '../../gamification/hooks/useGamification';
import { useTodo } from '../../todo/hooks/useTodo';


export const HeroProgressCard: React.FC = () => {
    const { gamification, isLoading: isGamificationLoading } = useGamification();
    const { stats, dailyXp, isLoading: isTodoLoading } = useTodo();

    if (isGamificationLoading || isTodoLoading) {
        return (
            <div className="w-full h-48 bg-[#18181B] rounded-2xl animate-pulse border border-[#27272A]" />
        );
    }

    const xpProgressPercent = (dailyXp.current / dailyXp.cap) * 100;

    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 md:p-8 flex flex-col gap-8 fade-in hover:shadow-md transition-shadow">
            {/* Top Row: Level & Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-1">
                        Level {gamification?.currentLevel || 1}
                    </h2>
                    <p className="text-xl font-medium text-zinc-200 flex items-center gap-2">
                        {gamification?.currentTitle || 'Beginner'}
                        {gamification?.isTitleLocked && (
                            <span className="text-yellow-500 text-sm bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-1">
                                🔒 Premium Title
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 md:gap-8">
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Tasks</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800 hidden md:block" />
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800 hidden md:block" />
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Shared</p>
                        <p className="text-2xl font-bold text-blue-500">{stats.shared || 0}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800 hidden md:block" />
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Daily XP</p>
                        <p className="text-2xl font-bold text-purple-500">{dailyXp.current} / {dailyXp.cap}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-[#A1A1AA]">Daily XP Progress</span>
                    <span className={dailyXp.current >= dailyXp.cap ? "text-green-500" : "text-purple-400"}>
                        {dailyXp.current >= dailyXp.cap ? "Daily Goal Achieved! 🔥" : `${dailyXp.cap - dailyXp.current} XP remaining today`}
                    </span>
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full bg-gradient-to-r ${dailyXp.current >= dailyXp.cap ? 'from-green-500 to-emerald-400' : 'from-purple-600 to-blue-500'} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(139,92,246,0.3)]`}
                        style={{ width: `${Math.min(100, xpProgressPercent)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
