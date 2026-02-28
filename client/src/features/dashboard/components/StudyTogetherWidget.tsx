import React from 'react';
import { Users } from 'lucide-react';

export const StudyTogetherWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[blueviolet]">⚡</span>
                <h2 className="text-xl font-bold text-white">Study Together</h2>
            </div>

            <div className="flex justify-center mb-6">
                <div className="relative">
                    <Users size={64} className="text-zinc-700" />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-zinc-900" />
                </div>
            </div>

            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                No Study Buddies Yet. Complete Your Profile To Get Your First Match.
            </p>

            <button className="w-full bg-gradient-to-r from-blue-600 to-[blueviolet] hover:from-blue-500 hover:to-[#7c2ae8] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                Find a study buddy
            </button>
        </div>
    );
};
