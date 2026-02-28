import React from 'react';
import { Users } from 'lucide-react';

export const SuggestedBuddiesWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5 h-[300px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <Users className="text-[blueviolet]" size={20} />
                <h2 className="text-lg font-bold text-white">Suggested Buddies</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 text-xs mb-4">Your Matches Will Appear Here</p>

                <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Users className="text-white" size={32} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full border-2 border-zinc-900">
                        <Users size={12} className="text-white" />
                    </div>
                </div>

                <p className="text-zinc-400 text-sm mb-6 max-w-[200px]">
                    Your Matches Will Appear Here Once You Complete Your Profile And Goals.
                </p>

                <button className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors border border-white/5">
                    Complete Profile To See Matches
                </button>
            </div>
        </div>
    );
};
