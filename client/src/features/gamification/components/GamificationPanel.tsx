import React from 'react';
import { Trophy, Flame, ChevronRight } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';

export const GamificationPanel: React.FC = () => {
    const { gamification, isLoading } = useGamification();

    if (isLoading || !gamification) {
        return (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-zinc-800 rounded mb-6"></div>
                <div className="h-20 bg-zinc-800 rounded"></div>
            </div>
        );
    }

    const {
        totalXp,
        currentLevel,
        currentTitle,
        xpForCurrentLevel,
        xpForNextLevel,
        xpProgress,
        currentStreak
    } = gamification;

    return (
        <div className="space-y-6">
            {/* Level & XP Card */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={80} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#4B0082] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#8A2BE2]/20 relative">
                                {currentLevel}
                                {gamification.rawLevel > currentLevel && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-zinc-900 shadow-lg" title="Upgrade to unlock more levels">
                                        <Clock size={8} className="text-zinc-900" strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                                    {currentTitle}
                                    {gamification.isTitleLocked && <Clock size={14} className="text-yellow-500/50" />}
                                </h3>
                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
                                    Level {currentLevel}
                                    {gamification.rawLevel > currentLevel && (
                                        <span className="text-yellow-500/80 ml-2 normal-case font-bold">
                                            ({gamification.rawLevel} Available in Premium)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-zinc-400">XP PROGRESS</span>
                            <span className="text-white">{totalXp} XP</span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-[#8A2BE2] to-[#7c2ae8] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(138,43,226,0.3)]"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                            <span>{xpForCurrentLevel} XP</span>
                            <span>{xpForNextLevel} XP TOTAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Card */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-zinc-800/80 transition-colors cursor-default">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${currentStreak > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'} transition-colors`}>
                        <Flame size={24} className={currentStreak > 0 ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">{currentStreak} Day Streak</p>
                        <p className="text-zinc-500 text-xs font-medium">Keep it up! Don't break the chain.</p>
                    </div>
                </div>
                <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
            </div>
        </div>
    );
};
