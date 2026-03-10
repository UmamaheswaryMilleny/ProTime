import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { TodoItem as ITodoItem } from '../types/todo.types';

interface TodoItemProps {
    todo: ITodoItem;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (todo: ITodoItem) => void;
    isStarted?: boolean;
    onStart?: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isStarted, onStart }) => {
    // Determine Priority Color
    const priorityColor =
        todo.priority === 'HIGH' ? 'text-red-500' :
            todo.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500';

    const isCompleted = todo.status === 'COMPLETED';
    const isExpired = todo.status === 'EXPIRED';

    // Derived XP params based on priority
    let baseXp = '2XP';
    if (todo.priority === 'MEDIUM') baseXp = '3XP';
    if (todo.priority === 'HIGH') baseXp = '5XP';

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`bg-zinc-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-zinc-800/50 ${isExpired ? 'opacity-60 grayscale-[0.5]' : ''}`}>

            {/* Left side: Checkbox + Content */}
            <div className="flex items-start gap-4 flex-1 w-full">
                {/* Custom Radio/Checkbox */}
                <button
                    onClick={() => {
                        if (!todo.pomodoroEnabled && !isExpired) {
                            onToggle(todo.id);
                        }
                    }}
                    disabled={todo.pomodoroEnabled || isExpired}
                    className={`mt-1 flex-shrink-0 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[blueviolet] transition-colors ${todo.pomodoroEnabled || isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                >
                    {isCompleted && <div className="w-2.5 h-2.5 rounded-full bg-[blueviolet]" />}
                </button>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-bold text-white truncate ${isCompleted ? 'line-through opacity-50' : ''}`}>
                            {todo.title}
                        </h3>
                        {isExpired && (
                            <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-tighter">Expired</span>
                        )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-4 truncate">
                        {todo.description}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
                        <span>{new Date(todo.createdAt).toISOString().split('T')[0]}</span>
                        <span>{todo.estimatedTime} Min</span>
                        <span className={priorityColor}>{todo.priority}</span>
                        <span>{todo.pomodoroEnabled ? 'Pomodoro' : 'Standard'}</span>
                        <span className="bg-yellow-500/10 text-yellow-500 px-1.5 rounded">{baseXp}</span>
                        {todo.pomodoroEnabled && <span className="text-[blueviolet] opacity-80">+ Bonus</span>}
                        {todo.expiryDate && (
                            <span className={isExpired ? 'text-red-400' : 'text-zinc-400'}>
                                Expires: {formatDate(todo.expiryDate)}
                            </span>
                        )}
                    </div>

                    {todo.pomodoroCompleted && !isCompleted && (
                        <div className="mt-2 text-[11px] font-bold text-green-400 flex items-center gap-1">
                            <span>✓ Pomodoro done — complete task to earn bonus XP</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4 self-end sm:self-center">
                {todo.pomodoroEnabled && (
                    <button
                        onClick={() => !isExpired && onStart && onStart(todo.id)}
                        disabled={isExpired}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg whitespace-nowrap min-w-[100px] ${isStarted
                            ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20'
                            : isExpired ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-[blueviolet] hover:bg-[#7c2ae8] text-white shadow-[blueviolet]/20'
                            }`}
                    >
                        {isStarted ? 'Started' : 'Start Timer'}
                    </button>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    <button onClick={() => onEdit(todo)} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(todo.id)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

        </div>
    );
};
