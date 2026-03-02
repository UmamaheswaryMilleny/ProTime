import React, { useState } from 'react';
import { Timer, CheckCircle2, Award, Flame } from 'lucide-react';

export const StatsSnapshotGrid: React.FC = () => {
    // Simulating free user state for the click interaction
    const [showPremiumOverlay, setShowPremiumOverlay] = useState<number | null>(null);

    const stats = [
        { id: 1, label: 'Focus Time Today', value: '4h 20m', icon: Timer, color: 'text-[#2563EB]' },
        { id: 2, label: 'Tasks Completed', value: '12', icon: CheckCircle2, color: 'text-[#22C55E]' },
        { id: 3, label: 'Badges Earned', value: '3', icon: Award, color: 'text-[blueviolet]' },
        { id: 4, label: 'Current Streak', value: '7 Days', icon: Flame, color: 'text-[#F97316]' },
    ];

    const handleCardClick = (id: number) => {
        setShowPremiumOverlay(id);
        // Auto-hide the overlay after a few seconds for demo purposes
        setTimeout(() => setShowPremiumOverlay(null), 3000);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full fade-in">
            {stats.map((stat) => (
                <div
                    key={stat.id}
                    onClick={() => handleCardClick(stat.id)}
                    className="relative bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 cursor-pointer hover:-translate-y-1 transition-transform overflow-hidden group"
                >
                    <div className={`absolute top-6 right-6 ${stat.color} opacity-80`}>
                        <stat.icon size={24} />
                    </div>

                    <div className="mt-2 text-3xl font-bold text-white mb-1">
                        {stat.value}
                    </div>
                    <div className="text-sm font-medium text-[#A1A1AA]">
                        {stat.label}
                    </div>

                    {/* Premium Blur Overlay */}
                    <div
                        className={`absolute inset-0 bg-[#09090B]/80 backdrop-blur-[2px] flex items-center justify-center p-4 text-center transition-opacity duration-300 ${showPremiumOverlay === stat.id ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
                    >
                        <p className="text-sm font-semibold text-white">
                            Unlock detailed analytics with Premium.
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
