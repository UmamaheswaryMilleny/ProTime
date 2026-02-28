import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { CreateTodoDTO, TodoItem, TodoPriority } from '../types/todo.types';

interface AddTodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (todo: CreateTodoDTO) => Promise<boolean>;
    onEdit?: (id: string, updates: Partial<CreateTodoDTO>) => Promise<boolean>;
    initialTodo?: TodoItem | null;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, onAdd, onEdit, initialTodo }) => {
    const defaultState: CreateTodoDTO = {
        title: '',
        description: '',
        priority: 'MEDIUM',
        estimatedTime: 25,
        pomodoroEnabled: true,
        smartBreaks: true, // Medium/High default
    };

    const [formData, setFormData] = useState<CreateTodoDTO>(defaultState);

    React.useEffect(() => {
        if (initialTodo && isOpen) {
            setFormData({
                title: initialTodo.title,
                description: initialTodo.description || '',
                priority: initialTodo.priority,
                estimatedTime: initialTodo.estimatedTime,
                pomodoroEnabled: initialTodo.pomodoroEnabled,
                smartBreaks: initialTodo.smartBreaks ?? true,
            });
        } else if (isOpen) {
            setFormData(defaultState);
        }
    }, [initialTodo, isOpen]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // Based on priority limits defined in backend constants
    const durationOptionsMap: Record<TodoPriority, number[]> = {
        LOW: [10, 15, 20],
        MEDIUM: [25, 30, 35, 40, 45],
        HIGH: [60, 90, 120, 180]
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };

            // Numeric fields cast
            if (name === 'estimatedTime') {
                nextData.estimatedTime = parseInt(value, 10);
            }

            // Sync defaults when priority changes
            if (name === 'priority') {
                const newPriority = value as TodoPriority;
                nextData.estimatedTime = durationOptionsMap[newPriority][0];

                // Clear smartBreaks for LOW tasks, set true otherwise if Pomodoro is enabled
                if (newPriority === 'LOW' || !nextData.pomodoroEnabled) {
                    nextData.smartBreaks = undefined;
                } else {
                    nextData.smartBreaks = true;
                }
            } else if (name === 'pomodoroEnabled') {
                // When pomodoro is toggled off, clear smartBreaks
                if (!nextData.pomodoroEnabled) {
                    nextData.smartBreaks = undefined;
                } else if (nextData.priority !== 'LOW') {
                    // When pomodoro is toggled on, default smartBreaks to true
                    nextData.smartBreaks = true;
                }
            }

            return nextData;
        });
    };

    const togglePomodoro = () => {
        setFormData(prev => {
            const willEnable = !prev.pomodoroEnabled;
            return {
                ...prev,
                pomodoroEnabled: willEnable,
                smartBreaks: willEnable && prev.priority !== 'LOW' ? true : undefined
            };
        });
    };

    const toggleSmartBreaks = () => {
        setFormData(prev => ({
            ...prev,
            smartBreaks: !prev.smartBreaks
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        let success = false;

        if (initialTodo && onEdit) {
            success = await onEdit(initialTodo.id, formData);
        } else if (onAdd) {
            success = await onAdd(formData);
        }

        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">{initialTodo ? 'Edit Task' : 'Add New Task'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm text-zinc-400">Title</label>
                        <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Study JavaScript"
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-zinc-400">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Cover topics like React forms and states"
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none resize-none h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-400">Priority</label>
                            <div className="relative">
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none cursor-pointer appearance-none">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-400">Estimated Time</label>
                            <div className="relative">
                                <select name="estimatedTime" value={formData.estimatedTime} onChange={handleChange} className="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none cursor-pointer appearance-none">
                                    {durationOptionsMap[formData.priority].map(opt => (
                                        <option key={opt} value={opt}>{opt} Minutes</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-1.5 flex flex-col justify-end pb-3">
                            {formData.pomodoroEnabled && formData.priority !== 'LOW' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={formData.smartBreaks}
                                            onClick={toggleSmartBreaks}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.smartBreaks ? 'bg-[#8A2BE2]' : 'bg-zinc-600'}`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.smartBreaks ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </button>
                                        <span className="text-sm font-medium text-white">Smart Breaks</span>
                                    </div>
                                    {!formData.smartBreaks && (
                                        <p className="text-xs text-amber-500/90 font-medium">Long sessions without breaks may reduce focus.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pb-2 pl-2">
                            {/* Custom Toggle Switch for Pomodoro */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={formData.pomodoroEnabled}
                                onClick={togglePomodoro}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.pomodoroEnabled ? 'bg-[#8A2BE2]' : 'bg-zinc-600'}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.pomodoroEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                                />
                            </button>
                            <span className="text-sm text-zinc-300">Pomodoro Timer</span>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center gap-4 border-t border-white/5 mt-6 pb-2">
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-lg text-sm font-medium text-white bg-[#8A2BE2] hover:bg-[#7c2ae8] transition-colors shadow-lg shadow-[#8A2BE2]/20 min-w-[140px] flex items-center justify-center">
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (initialTodo ? 'Save Changes' : 'Create Task')}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-8 py-2.5 rounded-lg text-sm font-medium text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors border border-white/5 min-w-[140px]">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
