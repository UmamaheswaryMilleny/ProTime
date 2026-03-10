import React from 'react';

import { useGamification } from '../../gamification/hooks/useGamification';
import { useAppSelector } from '../../../store/hooks';

export const HeroProgressCard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { gamification, isLoading } = useGamification();

    if (isLoading) {
        return (
            <div className="w-full h-48 bg-[#18181B] rounded-2xl animate-pulse border border-[#27272A]" />
        );
    }

    const xpProgressPercent = gamification
        ? Math.min(100, Math.max(0, (gamification.xpProgress / (gamification.xpForNextLevel - gamification.xpForCurrentLevel || 1)) * 100))
        : 0;

    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 fade-in hover:shadow-md transition-shadow">
            {/* Left Side: Progress Info */}
            <div className="flex-1 w-full space-y-4">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-1">
                        Level {gamification?.currentLevel || 1}
                    </h2>
                    <p className="text-xl font-medium text-zinc-200 flex items-center gap-2">
                        {gamification?.currentTitle || 'Beginner'}
                        {gamification?.isTitleLocked && <span className="text-zinc-500">🔒</span>}
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-[#A1A1AA]">Current Progress</span>
                        <span className="text-[#22C55E]">
                            {gamification?.xpProgress || 0} / {gamification ? gamification.xpForNextLevel - gamification.xpForCurrentLevel : 0} XP
                        </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                        {/* Animated Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-[#22C55E] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${xpProgressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side: Action */}
            <div className="flex flex-col md:items-end md:text-right gap-3 w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-3.5 bg-[#2563EB] hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95">
                    Continue Today's Task
                </button>
                {!user?.isPremium && (
                    <p className="text-xs text-[#A1A1AA] max-w-xs">
                        Upgrade to unlock advanced titles and badge bonuses.
                    </p>
                )}
            </div>
        </div>
    );
};
