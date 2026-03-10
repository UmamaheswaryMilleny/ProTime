import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useTodo } from '../../todo/hooks/useTodo';

export const NotificationBell: React.FC = () => {
    const { todos, deleteTodo } = useTodo();
    const [isOpen, setIsOpen] = useState(false);
    const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('protime_acknowledged_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter expired todos
    const expiredTodos = todos.filter(t => t.status === 'EXPIRED');
    const unacknowledgedTodos = expiredTodos.filter(t => !acknowledgedIds.includes(t.id));
    const hasNew = unacknowledgedTodos.length > 0;

    // Persist acknowledged IDs
    useEffect(() => {
        localStorage.setItem('protime_acknowledged_notifications', JSON.stringify(acknowledgedIds));
    }, [acknowledgedIds]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAcknowledge = (id: string) => {
        if (!acknowledgedIds.includes(id)) {
            setAcknowledgedIds(prev => [...prev, id]);
        }
    };

    const handleDelete = async (id: string) => {
        await deleteTodo(id);
        // Also remove from acknowledged if it was there
        setAcknowledgedIds(prev => prev.filter(item => item !== id));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all relative group"
            >
                <Bell size={20} />
                {hasNew && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-800 animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden fade-in">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-800/50">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                            {expiredTodos.length} Expired
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {expiredTodos.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {expiredTodos.map(todo => (
                                    <div key={todo.id} className={`p-4 hover:bg-white/5 transition-colors group ${!acknowledgedIds.includes(todo.id) ? 'bg-red-500/5' : ''}`}>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{todo.title}</p>
                                                <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{todo.description || 'No description'}</p>
                                            </div>
                                            {!acknowledgedIds.includes(todo.id) && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-3">
                                            <span className="text-[10px] text-zinc-500 font-medium">Expired</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAcknowledge(todo.id)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-green-500 hover:bg-green-500/10 transition-all"
                                                    title="Mark as Ready"
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(todo.id)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-zinc-600" />
                                </div>
                                <p className="text-zinc-400 text-sm">No new notifications</p>
                                <p className="text-zinc-600 text-xs mt-1">Everything is up to date!</p>
                            </div>
                        )}
                    </div>

                    {expiredTodos.length > 0 && (
                        <div className="p-3 bg-zinc-800/30 border-t border-white/5 text-center">
                            <p className="text-[10px] text-zinc-500 font-medium">
                                Acknowledging removes the red indicator
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
