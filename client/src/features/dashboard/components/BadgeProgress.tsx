import { Award, Lock } from 'lucide-react';
import { useGamification } from '../../gamification/hooks/useGamification';

export const BadgeProgress: React.FC = () => {
    const { gamification, isLoading } = useGamification();

    if (isLoading) {
        return (
            <div className="w-full bg-[#18181B] rounded-2xl border border-[#27272A] p-6 lg:p-8 animate-pulse h-96" />
        );
    }

    const earnedBadges = gamification?.earnedBadges || [];

    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-8 fade-in h-min">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Badge Progress</h2>
                    <p className="text-sm text-[#A1A1AA] mt-1">
                        You've earned {earnedBadges.length} {earnedBadges.length === 1 ? 'badge' : 'badges'} so far.
                    </p>
                </div>
                <button className="text-sm font-semibold text-[#2563EB] hover:text-blue-400 transition-colors">
                    View Gallery
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {earnedBadges.length > 0 ? (
                    earnedBadges.map((badge) => (
                        <div 
                            key={badge.id} 
                            className="bg-[#1F1F23] rounded-xl p-5 border border-yellow-500/20 flex items-center gap-5 group hover:border-yellow-500/40 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.05)]"
                        >
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] text-zinc-900 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                                <Award size={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-white truncate">{badge.name}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDB931] bg-[#FDB931]/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                        Earned
                                    </span>
                                </div>
                                <p className="text-xs text-[#A1A1AA] line-clamp-2">{badge.description}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#FDB931] to-[#D4AF37] w-full" />
                                    </div>
                                    <span className="text-[10px] font-bold text-yellow-500/50">100%</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500">No badges earned yet. Keep completing tasks!</p>
                    </div>
                )}

                {/* Show a locked placeholder if user has few badges */}
                {earnedBadges.length < 2 && (
                    <div className="bg-[#1F1F23]/50 rounded-xl p-5 border border-dashed border-zinc-800 flex items-center gap-5 grayscale opacity-60">
                        <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-600">
                            <Lock size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-zinc-400 mb-1">Upcoming Milestone</h3>
                            <p className="text-xs text-zinc-600">Complete more tasks to unlock elite badges.</p>
                            <div className="mt-3 h-1.5 bg-zinc-900 rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[blueviolet]/5 rounded-xl p-4 flex items-center gap-4 border border-[blueviolet]/10">
                <div className="p-2 rounded-lg bg-[blueviolet]/10 text-[blueviolet]">
                    <Award size={20} />
                </div>
                <p className="text-xs text-zinc-300">
                    <span className="font-bold text-white">Premium Required:</span> Rare and Epic badges provide permanent XP multipliers.
                </p>
            </div>
        </div>
    );
};
