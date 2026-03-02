import React from 'react';
import { Target, Shield, Sword, Crown, Lock } from 'lucide-react';

export const BadgeProgress: React.FC = () => {
    const badges = [
        { id: 1, name: 'Deep Work Master', progress: 7, total: 10, icon: Target, isLocked: false, color: '#2563EB' },
        { id: 2, name: 'Consistency King', progress: 14, total: 30, icon: Shield, isLocked: false, color: '#F97316' },
        { id: 3, name: 'Task Gladiator', progress: 42, total: 50, icon: Sword, isLocked: false, color: '#22C55E' },
        { id: 4, name: 'ProTime Titan', progress: 0, total: 1, icon: Crown, isLocked: true, color: '#A1A1AA' },
        { id: 5, name: 'Elite Focus', progress: 0, total: 100, icon: Shield, isLocked: true, color: '#A1A1AA' },
    ];

    return (
        <div className="w-full fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Badge Progress</h2>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`min-w-[240px] relative rounded-2xl border border-[#27272A] p-5 snap-start shrink-0 overflow-hidden group 
                            ${badge.isLocked ? 'bg-[#18181B] border-zinc-800' : 'bg-[#18181B] hover:-translate-y-1 hover:shadow-lg transition-all'}
                        `}
                    >
                        {/* Shine effect for unlocked */}
                        {!badge.isLocked && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/5 to-transparent transition-opacity duration-500 pointer-events-none" />
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`p-2.5 rounded-xl ${badge.isLocked ? 'bg-zinc-800 text-zinc-500' : 'bg-opacity-10'}`}
                                style={!badge.isLocked ? { backgroundColor: `${badge.color}15`, color: badge.color } : {}}
                            >
                                <badge.icon size={24} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${badge.isLocked ? 'text-zinc-500' : 'text-zinc-200'}`}>
                                    {badge.name}
                                </h3>
                                {!badge.isLocked && (
                                    <p className="text-xs font-medium text-[#A1A1AA] mt-0.5">
                                        {badge.progress} / {badge.total}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar or Locked UI */}
                        {!badge.isLocked ? (
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${(badge.progress / badge.total) * 100}%`, backgroundColor: badge.color }}
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-[#09090B]/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                                <Lock size={20} className="text-zinc-500 mb-1" />
                                <span className="text-xs font-semibold text-zinc-400">Premium Required</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
};
