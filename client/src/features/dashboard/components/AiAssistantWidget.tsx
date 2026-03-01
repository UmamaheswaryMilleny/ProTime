import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export const AiAssistantWidget: React.FC = () => {
    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
                <Bot className="text-[blueviolet]" size={20} />
                {/* Title matches the AI/Bot context despite design image saying Reputation & Feedback */}
                <h2 className="text-lg font-bold text-white">AI Assistant</h2>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-4 mb-4 border border-white/5 relative">
                <p className="text-white text-xs leading-relaxed italic">
                    "Hi Alex, I Can Help Plan Your Study Sessions. Want Me To Create Your First Weekly Plan?"
                </p>
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-zinc-800 border-r border-b border-white/5 transform rotate-45"></div>
            </div>

            <button className="w-full bg-[#5b2091] hover:bg-[blueviolet] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-[blueviolet]/20 flex items-center justify-center gap-2 text-sm">
                <Sparkles size={16} />
                Open AI Assistant
            </button>
        </div>
    );
};
