import React from 'react';
import type { Message } from '../hooks/useProBuddyChat';

interface ProBuddyMessageProps {
  message: Message;
}

export const ProBuddyMessage: React.FC<ProBuddyMessageProps> = ({ message }) => {
  const isAi = message.role === 'assistant';
  const timeString = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isAi) {
    return (
      <div className="flex flex-col mb-4 items-start group">
        <div className="flex items-center mb-1.5 ml-1 text-[blueviolet] font-bold text-[10px] uppercase tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="bg-[blueviolet]/10 p-1 rounded-md mr-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          ProBuddy Assistant
        </div>
        <div className="flex flex-col max-w-[90%] sm:max-w-[80%]">
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-[blueviolet] to-[#7f00ff] text-white shadow-xl shadow-[blueviolet]/10 rounded-tl-none border border-white/10 transition-transform hover:scale-[1.01] duration-200">
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed selection:bg-white/30">
              {message.content}
            </p>
          </div>
          <div className="flex items-center mt-1.5 text-[10px] text-zinc-500 font-medium justify-start px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>{timeString}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-4 items-end group">
      <div className="flex flex-col max-w-[90%] sm:max-w-[80%]">
        <div className="px-4 py-3 rounded-2xl bg-zinc-800 text-zinc-100 rounded-tr-none border border-white/5 shadow-lg group-hover:border-[blueviolet]/20 transition-all duration-200">
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed selection:bg-[blueviolet]/30">
            {message.content}
          </p>
        </div>
        <div className="flex items-center mt-1.5 text-[10px] text-zinc-500 font-medium justify-end px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{timeString}</span>
        </div>
      </div>
    </div>
  );
};

export const ProBuddyLoading: React.FC = () => {
  return (
    <div className="flex flex-col mb-4 items-start">
      <div className="flex items-center mb-1.5 ml-1 text-[blueviolet] font-bold text-[10px] uppercase tracking-tighter">
        <div className="bg-[blueviolet]/10 p-1 rounded-md mr-1.5">
          <svg
            className="w-3 h-3 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        ProBuddy is thinking...
      </div>
      <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner">
        <div className="w-1.5 h-1.5 bg-[blueviolet] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-[blueviolet] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-[blueviolet] rounded-full animate-bounce" />
      </div>
    </div>
  );
};
