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

    // Derived XP params based on priority
    let maxXp = '4XP MAX';
    if (todo.priority === 'MEDIUM') maxXp = '6XP MAX';
    if (todo.priority === 'HIGH') maxXp = '10XP MAX';

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-zinc-800/50">

            {/* Left side: Checkbox + Content */}
            <div className="flex items-start gap-4 flex-1 w-full">
                {/* Custom Radio/Checkbox */}
                <button
                    onClick={() => {
                        if (!todo.pomodoroEnabled) {
                            onToggle(todo.id);
                        }
                    }}
                    disabled={todo.pomodoroEnabled}
                    className={`mt-1 flex-shrink-0 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[blueviolet] transition-colors ${todo.pomodoroEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                >
                    {isCompleted && <div className="w-2.5 h-2.5 rounded-full bg-[blueviolet]" />}
                </button>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold text-white mb-1 truncate ${isCompleted ? 'line-through opacity-50' : ''}`}>
                        {todo.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 truncate">
                        {todo.description}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
                        <span>{new Date(todo.createdAt).toISOString().split('T')[0]}</span>
                        <span>{todo.estimatedTime} Min</span>
                        <span className={priorityColor}>{todo.priority}</span>
                        <span>{todo.pomodoroEnabled ? 'Pomodoro' : 'Standard'}</span>
                        <span>{maxXp}</span>
                    </div>
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4 self-end sm:self-center">
                {todo.pomodoroEnabled && (
                    <button
                        onClick={() => onStart && onStart(todo.id)}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg whitespace-nowrap min-w-[100px] ${isStarted
                            ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20'
                            : 'bg-[blueviolet] hover:bg-[#7c2ae8] text-white shadow-[blueviolet]/20'
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
