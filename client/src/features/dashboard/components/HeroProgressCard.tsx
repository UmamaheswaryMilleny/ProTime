import React from 'react';

export const HeroProgressCard: React.FC = () => {
    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 fade-in hover:shadow-md transition-shadow">
            {/* Left Side: Progress Info */}
            <div className="flex-1 w-full space-y-4">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-1">Level 8</h2>
                    <p className="text-xl font-medium text-zinc-200 flex items-center gap-2">
                        Explorer <span className="text-zinc-500">🔒</span>
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-[#A1A1AA]">Current Progress</span>
                        <span className="text-[#22C55E]">420 / 450 XP</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                        {/* Animated Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-[#22C55E] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: '93.33%' }} // 420/450
                        />
                    </div>
                </div>
            </div>

            {/* Right Side: Action */}
            <div className="flex flex-col md:items-end md:text-right gap-3 w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-3.5  bg-[#5b2091] hover:bg-[#8A2BE2] text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95">
                    Continue Today's Task
                </button>
                <p className="text-xs text-[#A1A1AA] max-w-xs">
                    Upgrade to unlock advanced titles and badge bonuses.
                </p>
            </div>
        </div>
    );
};
