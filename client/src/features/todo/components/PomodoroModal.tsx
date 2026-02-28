import React from 'react';
import { Minimize2, X } from 'lucide-react';
import type { TodoItem } from '../types/todo.types';

interface PomodoroModalProps {
    isOpen: boolean;
    task: TodoItem | null;
    timeRemainingFormatted: string;
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onMinimize: () => void;
    onClose: () => void;
    progressPercentage: number;
    phase: 'FOCUS' | 'BREAK';
    onSkipBreak?: () => void;
    isSmartBreaksEnabled: boolean;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
    isOpen,
    task,
    timeRemainingFormatted,
    isRunning,
    onStart,
    onPause,
    onReset,
    onMinimize,
    onClose,
    progressPercentage,
    phase,
    onSkipBreak,
    isSmartBreaksEnabled
}) => {
    if (!isOpen || !task) return null;

    // SVG parameters for progress ring
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2A2B36] rounded-3xl w-full max-w-lg border border-white/5 overflow-hidden shadow-2xl p-6 relative">

                <div className="absolute top-5 right-5 flex items-center gap-2">
                    <button onClick={onMinimize} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <Minimize2 size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="text-center mb-6 mt-4">
                    <h2 className="text-xl font-bold text-white">
                        {phase === 'BREAK' ? 'Break Time' : 'Pomodoro Timer'}
                    </h2>
                    {phase === 'BREAK' && (
                        <p className="text-sm text-zinc-400 mt-2">Relax your eyes. Drink some water.</p>
                    )}
                </div>

                {/* Circular Timer Ring */}
                <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 250 250">
                        <circle
                            cx="125" cy="125" r={radius}
                            fill="transparent"
                            stroke="#3f3f46"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="125" cy="125" r={radius}
                            fill="transparent"
                            stroke="#8A2BE2"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="flex flex-col items-center justify-center z-10 transition-transform">
                        <span className={`text-xs font-bold tracking-widest mb-1.5 ${phase === 'BREAK' ? 'text-teal-400' : 'text-[#8A2BE2]'}`}>
                            {phase.toUpperCase()}
                        </span>
                        <span className="text-4xl font-bold text-white tracking-widest">{timeRemainingFormatted.replace(':', ' : ')}</span>
                    </div>
                </div>

                {/* Settings Section */}
                {/* Smart Break Info */}
                {task.priority !== 'LOW' && phase === 'FOCUS' && (
                    <div className="bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-xl p-4 mb-6 flex flex-col items-center justify-center min-h-[64px]">
                        {isSmartBreaksEnabled ? (
                            <p className="text-sm text-teal-400 font-medium flex items-center gap-2">
                                <span>✨</span>
                                {task.priority === 'HIGH'
                                    ? 'Smart Breaks: 50m Focus / 10m Break cycle active'
                                    : 'Smart Breaks enabled: Break will auto-start next'}
                            </p>
                        ) : (
                            <p className="text-sm text-amber-400/90 font-medium text-center">
                                Long sessions without breaks may reduce focus.
                            </p>
                        )}
                    </div>
                )}

                {/* Buttons */}
                {/* Buttons */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    {phase === 'BREAK' && onSkipBreak ? (
                        <>
                            <button
                                onClick={onSkipBreak}
                                className="px-6 py-2.5 rounded-xl text-white font-bold bg-teal-500 hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20 flex-1"
                            >
                                Skip Break
                            </button>
                            <button
                                onClick={isRunning ? onPause : onStart}
                                className="px-6 py-2.5 rounded-xl text-white font-bold bg-teal-600 hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/20 flex-1"
                            >
                                {isRunning ? 'Pause Break' : 'Resume Break'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={isRunning ? onPause : onStart}
                            className={`px-8 py-2.5 rounded-xl text-white font-bold transition-colors shadow-lg flex-1 bg-[#8A2BE2] hover:bg-[#7c2ae8] shadow-[#8A2BE2]/20`}
                        >
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                    )}
                    <button
                        onClick={onReset}
                        className="px-8 py-2.5 rounded-xl text-white font-bold bg-zinc-800 hover:bg-zinc-700 transition-colors border border-white/10 flex-1"
                    >
                        Reset
                    </button>
                </div>

            </div>
        </div>
    );
};
