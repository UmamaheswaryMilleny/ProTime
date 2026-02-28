import React, { useState } from 'react';
import { Target, CheckCircle2, Users, TrendingUp, Filter } from 'lucide-react';
import { useTodo } from '../hooks/useTodo';
import { TodoList } from '../components/TodoList';
import { AddTodoModal } from '../components/AddTodoModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PomodoroModal } from '../components/PomodoroModal';
import { PomodoroMinimized } from '../components/PomodoroMinimized';
import { PomodoroCompletedModal } from '../components/PomodoroCompletedModal';
import { useTimer } from '../hooks/useTimer';

import type { TodoItem } from '../types/todo.types';

export const TodoPage: React.FC = () => {
    const { todos, isLoading, stats, dailyXp, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodo();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
    const [filter, setFilter] = useState<'All Tasks' | 'Active' | 'Completed'>('All Tasks');
    const [lastEarnedXp, setLastEarnedXp] = useState<number>(0);

    // Pomodoro State - Persistent
    const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
        return localStorage.getItem('pomodoro_activeTaskId') || null;
    });
    const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(() => {
        return localStorage.getItem('pomodoro_isModalOpen') === 'true';
    });
    const [isPomodoroMinimized, setIsPomodoroMinimized] = useState(() => {
        return localStorage.getItem('pomodoro_isMinimized') === 'true';
    });
    const [isPomodoroCompletedOpen, setIsPomodoroCompletedOpen] = useState(false);

    // Save UI state to localStorage when it changes
    React.useEffect(() => {
        if (activeTaskId) {
            localStorage.setItem('pomodoro_activeTaskId', activeTaskId);
        } else {
            localStorage.removeItem('pomodoro_activeTaskId');
        }
        localStorage.setItem('pomodoro_isModalOpen', isPomodoroModalOpen.toString());
        localStorage.setItem('pomodoro_isMinimized', isPomodoroMinimized.toString());
    }, [activeTaskId, isPomodoroModalOpen, isPomodoroMinimized]);

    const activeTask = React.useMemo(() => {
        return todos.find(t => t.id === activeTaskId) || null;
    }, [todos, activeTaskId]);

    const handlePomodoroComplete = async () => {
        let earnedXp = 0;
        if (activeTask && activeTask.status !== 'COMPLETED') {
            const timeSpent = activeTask.estimatedTime * 60;
            const result = await toggleTodo(activeTask.id, timeSpent);
            if (result && result.earnedXp !== undefined) {
                earnedXp = result.earnedXp;
            }
        }
        setLastEarnedXp(earnedXp);
        setIsPomodoroModalOpen(false);
        setIsPomodoroMinimized(false);
        setIsPomodoroCompletedOpen(true);
    };

    const {
        timeRemaining,
        timeRemainingFormatted,
        isRunning,
        phase,
        initialTime,
        isSmartBreaksEnabled,
        start,
        pause,
        reset,
        skipBreak
    } = useTimer({
        task: activeTask,
        timerKey: activeTask ? `pomodoro_${activeTask.id}` : undefined,
        onComplete: handlePomodoroComplete
    });

    const handleStartTimer = (id: string) => {
        if (activeTaskId === id) {
            // Re-open modal if clicking started task
            setIsPomodoroMinimized(false);
            setIsPomodoroModalOpen(true);
        } else {
            setActiveTaskId(id);
            setIsPomodoroMinimized(false);
            setIsPomodoroModalOpen(true);
            // It resets automatically via useEffect
        }
    };

    const handleStopTimer = () => {
        pause();
        setActiveTaskId(null);
        setIsPomodoroMinimized(false);
        setIsPomodoroModalOpen(false);
    };

    const filteredTodos = todos.filter(t => {
        if (filter === 'Active') return t.status === 'PENDING';
        if (filter === 'Completed') return t.status === 'COMPLETED';
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">


            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">To-Do List</h1>
                    <p className="text-zinc-400 text-sm">Organize Your Tasks, Track Progress, And Collaborate With Your Study Buddy</p>
                </div>

                <div className="flex items-center gap-4">
                    <PomodoroMinimized
                        isVisible={isPomodoroMinimized && activeTask !== null}
                        timeRemainingFormatted={timeRemainingFormatted}
                        isRunning={isRunning}
                        onStart={start}
                        onPause={pause}
                        onStop={handleStopTimer}
                        onMaximize={() => {
                            setIsPomodoroMinimized(false);
                            setIsPomodoroModalOpen(true);
                        }}
                    />

                    {/* Daily XP Badge */}
                    <div className="bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg shadow-[#8A2BE2]/5 min-w-[200px]">
                        <div className="bg-[#8A2BE2]/20 p-2.5 rounded-lg flex items-center justify-center">
                            <span className="text-2xl leading-none">⭐</span>
                        </div>
                        <div>
                            <p className="text-[11px] text-[#8A2BE2] font-bold uppercase tracking-wider mb-0.5">Today's XP</p>
                            <p className="text-white font-bold text-xl flex items-center gap-1.5">
                                {dailyXp?.current ?? 0} <span className="text-zinc-500 text-sm font-medium">/ {dailyXp?.cap ?? 50}</span>
                                {dailyXp?.current >= (dailyXp?.cap ?? 50) && <span className="text-green-500 text-sm flex items-center ml-1"><CheckCircle2 size={16} /></span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Target size={18} /></div>
                        <span className="text-zinc-400 text-sm font-medium">Total Tasks</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats.total}</span>
                </div>

                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 size={18} /></div>
                        <span className="text-zinc-400 text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats.completed}</span>
                </div>

                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400"><Users size={18} /></div>
                        <span className="text-zinc-400 text-sm font-medium">Shared</span>
                    </div>
                    <span className="text-3xl font-bold text-white">0</span>
                </div>

                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><TrendingUp size={18} /></div>
                        <span className="text-zinc-400 text-sm font-medium">Progress</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats.progress}%</span>
                </div>
            </div>

            {/* Main Controls Panel */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-black border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:ring-2 focus:ring-[blueviolet] outline-none appearance-none cursor-pointer font-medium"
                        >
                            <option>All Tasks</option>
                            <option>Active</option>
                            <option>Completed</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTodo(null);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#8A2BE2]/20"
                    >
                        Add Task
                    </button>
                </div>

                {/* Progress Bar inside Controls panel */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 font-medium">Progress</span>
                        <span className="text-white font-bold">{stats.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-600 transition-all duration-500 ease-out"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Task List Panel */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-2 sm:p-6 min-h-[400px]">
                <TodoList
                    todos={filteredTodos}
                    isLoading={isLoading}
                    onToggle={toggleTodo}
                    onDelete={(id) => setTodoToDelete(id)}
                    onEdit={(todo) => {
                        setEditingTodo(todo);
                        setIsAddModalOpen(true);
                    }}
                    activeTaskId={activeTaskId}
                    isTimerRunning={isRunning}
                    onStartTimer={handleStartTimer}
                />
            </div>

            {/* Add/Edit Todo Modal */}
            <AddTodoModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingTodo(null);
                }}
                onAdd={addTodo}
                onEdit={updateTodo}
                initialTodo={editingTodo}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={!!todoToDelete}
                onClose={() => setTodoToDelete(null)}
                onConfirm={async () => {
                    if (todoToDelete) {
                        await deleteTodo(todoToDelete);
                        setTodoToDelete(null);
                    }
                }}
            />

            {/* Pomodoro Timer Modal */}
            <PomodoroModal
                isOpen={isPomodoroModalOpen}
                task={activeTask}
                timeRemainingFormatted={timeRemainingFormatted}
                isRunning={isRunning}
                onStart={start}
                onPause={pause}
                onReset={() => reset()}
                onMinimize={() => {
                    setIsPomodoroModalOpen(false);
                    setIsPomodoroMinimized(true);
                }}
                onClose={handleStopTimer}
                progressPercentage={(timeRemaining / initialTime) * 100}
                phase={phase}
                onSkipBreak={skipBreak}
                isSmartBreaksEnabled={isSmartBreaksEnabled}
            />

            {/* Pomodoro Completed Success Modal */}
            <PomodoroCompletedModal
                isOpen={isPomodoroCompletedOpen}
                task={activeTask}
                earnedXp={lastEarnedXp}
                onClose={() => {
                    setIsPomodoroCompletedOpen(false);
                    setActiveTaskId(null);
                    if (activeTask) {
                        localStorage.removeItem(`pomodoro_${activeTask.id}_timeRemaining`);
                        localStorage.removeItem(`pomodoro_${activeTask.id}_isRunning`);
                    }
                }}
            />
        </div>
    );
};
