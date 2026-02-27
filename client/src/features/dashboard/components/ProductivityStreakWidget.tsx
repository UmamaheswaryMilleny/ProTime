import React from 'react';
import { Star } from 'lucide-react';

export const ProductivityStreakWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5 text-center">
            <div className="flex items-center gap-2 mb-6">
                <Star className="text-[blueviolet]" size={20} />
                <h2 className="text-lg font-bold text-white">Productivity Streak</h2>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <span className="text-6xl font-bold text-orange-500 mb-2">1</span>

                <div className="bg-zinc-800 px-6 py-1.5 rounded-full text-sm font-medium text-white mb-4 border border-white/5">
                    Day 1
                </div>

                <p className="text-zinc-500 text-xs">
                    Your Productivity Steak Starts Today!
                </p>
            </div>
        </div>
    );
};
