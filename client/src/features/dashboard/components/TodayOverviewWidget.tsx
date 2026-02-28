import React from 'react';
import { Clock } from 'lucide-react';

export const TodayOverviewWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5 h-[300px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <Clock className="text-[blueviolet]" size={20} />
                <h2 className="text-lg font-bold text-white">Today's Overview</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-600">
                    <CalendarIcon />
                </div>
                <p className="text-zinc-400 text-sm mb-6">You Have No Upcoming Sessions Yet.</p>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors border border-white/5">
                    Schedule Your First Session
                </button>
            </div>
        </div>
    );
};

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
    </svg>
);
