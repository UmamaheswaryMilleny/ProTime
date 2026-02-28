import React from 'react';
import { Play, Pause, Square, Maximize2 } from 'lucide-react';

interface PomodoroMinimizedProps {
    isVisible: boolean;
    timeRemainingFormatted: string;
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
    onStop: () => void;
    onMaximize: () => void;
}

export const PomodoroMinimized: React.FC<PomodoroMinimizedProps> = ({
    isVisible,
    timeRemainingFormatted,
    isRunning,
    onStart,
    onPause,
    onStop,
    onMaximize
}) => {
    if (!isVisible) return null;

    return (
        <div className="bg-[#8A2BE2] rounded-full pl-4 pr-2 py-1.5 flex items-center gap-4 shadow-[#8A2BE2]/30 shadow-lg">
            <span className="text-white font-bold text-sm tracking-widest min-w-[50px] text-center">
                {timeRemainingFormatted}
            </span>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={isRunning ? onPause : onStart}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#8A2BE2] hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer"
                >
                    {isRunning ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                </button>

                <button
                    onClick={onStop}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
                >
                    <Square size={12} className="fill-current" />
                </button>

                <button
                    onClick={onMaximize}
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors ml-2 cursor-pointer"
                >
                    <Maximize2 size={14} />
                </button>
            </div>
        </div>
    );
};
