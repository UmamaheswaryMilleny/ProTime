import React from 'react';
import { ArrowUpRight, CheckCircle, Flame, Clock } from 'lucide-react';

interface SummaryCardsProps {
    totalXp: number;
    tasksTotal: number;
    tasksPomodoro: number;
    tasksNonPomodoro: number;
    currentStreak: number;
    longestStreak?: number;
    focusTimeStr: string; // e.g. "12h 30m"
}

export const ReportSummaryCards: React.FC<SummaryCardsProps> = ({
    totalXp,
    tasksTotal,
    tasksPomodoro,
    tasksNonPomodoro,
    currentStreak,
    longestStreak = 0,
    focusTimeStr
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* XP Card */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowUpRight size={48} className="text-[blueviolet]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium mb-1">Total XP Earned</span>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{totalXp.toLocaleString()}</span>
                        <span className="text-green-400 text-xs font-semibold flex items-center mb-1">
                            ↑ 12%
                        </span>
                    </div>
                </div>
            </div>

            {/* Tasks Completed Card */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle size={48} className="text-[blueviolet]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium mb-1">Tasks Completed</span>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{tasksTotal}</span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
                        <span>{tasksPomodoro} w/ Pomo</span>
                        <span>{tasksNonPomodoro} w/o Pomo</span>
                    </div>
                </div>
            </div>

            {/* Streak Card */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Flame size={48} className="text-orange-500 animate-pulse" />
                </div>
                <div className="flex flex-col justify-between h-full">
                    <div>
                        <span className="text-zinc-400 text-sm font-medium mb-1 block">Streak Stats</span>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Current</span>
                                <span className="text-2xl font-extrabold text-white flex items-center gap-1">
                                    {currentStreak}
                                    <span className="text-base text-orange-500">🔥</span>
                                </span>
                            </div>
                            <div className="border-l border-white/5 pl-4">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Longest</span>
                                <span className="text-2xl font-extrabold text-amber-400 flex items-center gap-1">
                                    {longestStreak}
                                    <span className="text-base">👑</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className="mt-3 text-[10px] text-zinc-500 block">Based on daily Pomodoro usage</span>
                </div>
            </div>

            {/* Focus Time */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Clock size={48} className="text-blue-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium mb-1">Focus Time</span>
                    <span className="text-3xl font-bold text-white">{focusTimeStr}</span>
                    <span className="mt-2 text-xs text-zinc-500">Total hours spent in Pomodoro</span>
                </div>
            </div>
        </div>
    );
};
