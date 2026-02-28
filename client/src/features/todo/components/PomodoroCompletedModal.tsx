import React from 'react';
import { X } from 'lucide-react';
import type { TodoItem } from '../types/todo.types';

interface PomodoroCompletedModalProps {
    isOpen: boolean;
    task: TodoItem | null;
    earnedXp?: number;
    onClose: () => void;
}

export const PomodoroCompletedModal: React.FC<PomodoroCompletedModalProps> = ({ isOpen, task, earnedXp = 0, onClose }) => {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2A2B36] rounded-xl w-full max-w-lg border border-white/5 overflow-hidden shadow-2xl p-8 relative flex flex-col items-center text-center">

                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="text-6xl mb-4 mt-2">
                    🎉
                </div>

                <h2 className="text-2xl font-bold text-white mb-6 leading-tight">
                    {earnedXp > 0 ? (
                        <>Congratulations You<br />Gained + {earnedXp} XP</>
                    ) : (
                        <>Task Completed<br /><span className="text-xl text-zinc-400">Daily XP limit reached</span></>
                    )}
                </h2>

                <p className="text-[#eab308] font-medium mb-6">
                    You have completed your pomodoro timer
                </p>

                <div className="text-white text-lg space-y-2 mb-8">
                    <p>Task : {task.title}</p>
                    <p>Prioity : {task.priority}</p>
                </div>

                <button
                    onClick={onClose}
                    className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#8A2BE2] hover:bg-[#7c2ae8] transition-colors shadow-lg shadow-[#8A2BE2]/20"
                >
                    Next Task
                </button>
            </div>
        </div>
    );
};
