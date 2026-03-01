import React from 'react';
import { Quote } from 'lucide-react';

export const DailyQuoteWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
                <Quote className="text-[blueviolet]" size={20} />
                <h2 className="text-lg font-bold text-white">Today's Quote's</h2>
            </div>

            <p className="text-white text-xs font-medium leading-relaxed italic">
                "Small Daily Improvements Over Time Lead To Stunning Results."
            </p>
        </div>
    );
};
