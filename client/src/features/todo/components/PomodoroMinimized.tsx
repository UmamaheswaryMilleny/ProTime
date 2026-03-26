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
    readOnly?: boolean;
}

export const PomodoroMinimized: React.FC<PomodoroMinimizedProps> = ({
    isVisible,
    timeRemainingFormatted,
    isRunning,
    onStart,
    onPause,
    onStop,
    onMaximize,
    readOnly = false
}) => {
    if (!isVisible) return null;

    return (
        <div className={`rounded-full pl-4 ${readOnly ? 'pr-4' : 'pr-2'} py-1.5 flex items-center gap-4 shadow-lg ${readOnly ? 'bg-zinc-800 border border-white/10 shadow-black/20' : 'bg-[#8A2BE2] shadow-[#8A2BE2]/30'}`}>
            <span className={`font-bold text-sm tracking-widest min-w-[50px] text-center ${readOnly ? 'text-zinc-400' : 'text-white'}`}>
                {timeRemainingFormatted}
            </span>

            {!readOnly && (
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
            )}
            
            {readOnly && (
                <div className="flex items-center">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Buddy focusing</span>
                </div>
            )}
        </div>
    );
};
