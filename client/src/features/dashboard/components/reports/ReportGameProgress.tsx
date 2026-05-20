import React from 'react';
import { Trophy, Lock } from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
}

interface ReportGameProgressProps {
    level: number;
    title: string;
    currentXp: number;
    nextLevelXp: number;
    badges: Badge[];
}

export const ReportGameProgress: React.FC<ReportGameProgressProps> = ({ level, title, currentXp, nextLevelXp, badges }) => {
    const progressPercent = Math.min(((currentXp) / nextLevelXp) * 100, 100);

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                
                {/* Level Info */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#4c1d95] rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-[#8b5cf6]/20">
                                <span className="text-white font-bold text-lg">{level}</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{title}</h3>
                                <p className="text-zinc-400 text-sm">Level {level} Scholar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-white font-bold">{currentXp}</span>
                            <span className="text-zinc-500 text-sm"> / {nextLevelXp} XP</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-[#8b5cf6] to-purple-400 transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-16 bg-white/10" />

                {/* Badges Preview */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                            <Trophy size={16} className="text-yellow-500" />
                            Recent Badges
                        </h4>
                        <span className="text-xs text-[blueviolet] cursor-pointer hover:underline">View all</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {badges.map(badge => (
                            <div 
                                key={badge.id}
                                className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 ${badge.unlocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700 bg-zinc-800'} relative group cursor-pointer`}
                                title={badge.name}
                            >
                                <span className={`text-2xl ${!badge.unlocked && 'grayscale opacity-50'}`}>{badge.icon}</span>
                                {!badge.unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                        <Lock size={12} className="text-zinc-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
