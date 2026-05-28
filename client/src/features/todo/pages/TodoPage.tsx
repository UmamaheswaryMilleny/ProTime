import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Target, CheckCircle2, X, TrendingUp, Filter, Flame } from 'lucide-react';
import { useTodo } from '../hooks/useTodo';
import { TodoList } from '../components/TodoList';
import { AddTodoModal } from '../components/AddTodoModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PomodoroModal } from '../components/PomodoroModal';
import { PomodoroMinimized } from '../components/PomodoroMinimized';
import { PomodoroCompletedModal } from '../components/PomodoroCompletedModal';
import { useTimer } from '../hooks/useTimer';


import { useGamification } from '../../gamification/hooks/useGamification';
import type { TodoItem } from '../types/todo.types';
import { useAppSelector } from '../../../store/hooks';

export const TodoPage: React.FC = () => {
    const {
        todos,
        isLoading,
        stats,
        dailyXp,
        page,
        setPage,
        filter,
        setFilter,
        totalPages,
        totalItems,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo
    } = useTodo();
    const { refreshGamification, gamification } = useGamification();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
    const [lastEarnedXp, setLastEarnedXp] = useState<number>(0);

    const handleFilterChange = (val: string) => {
        const newFilter =
            val === 'Active' ? 'pending'
            : val === 'Completed' ? 'completed'
            : val === 'Expired' ? 'expired'
            : 'all';
        setFilter(newFilter);
        setPage(1);
    };

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

    const reduxPomodoro = useAppSelector((state) => state.pomodoro);

    const activeTask = React.useMemo(() => {
        return todos.find(t => t.id === activeTaskId) || null;
    }, [todos, activeTaskId]);

    // Save UI state to localStorage when it changes
    React.useEffect(() => {
        if (activeTaskId) {
            localStorage.setItem('pomodoro_activeTaskId', activeTaskId);
            if (activeTask) {
                localStorage.setItem('pomodoro_activeTaskTitle', activeTask.title);
            }
        } else {
            localStorage.removeItem('pomodoro_activeTaskId');
            localStorage.removeItem('pomodoro_activeTaskTitle');
        }
        localStorage.setItem('pomodoro_isModalOpen', isPomodoroModalOpen.toString());
        localStorage.setItem('pomodoro_isMinimized', isPomodoroMinimized.toString());
    }, [activeTaskId, activeTask, isPomodoroModalOpen, isPomodoroMinimized]);

    const handlePomodoroComplete = React.useCallback(async (pausedSeconds: number) => {
        let earnedXp = 0;
        if (activeTask && activeTask.status !== 'COMPLETED') {
            const timeSpent = activeTask.estimatedTime * 60;
            const result = await toggleTodo(activeTask.id, timeSpent, pausedSeconds);
            if (result && result.earnedXp !== undefined) {
                earnedXp = result.earnedXp;
            }
        }
        setLastEarnedXp(earnedXp);
        refreshGamification();
        setIsPomodoroModalOpen(false);
        setIsPomodoroMinimized(false);
        setIsPomodoroCompletedOpen(true);
    }, [activeTask, toggleTodo, refreshGamification]);

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
        skipBreak,
        totalPausedSeconds
    } = useTimer({
        task: activeTask,
        timerKey: activeTaskId ? `pomodoro_${activeTaskId}` : undefined,
        onComplete: handlePomodoroComplete
    });

    const handleStartTimer = (id: string) => {
        if (activeTaskId === id) {
            // Re-open modal if clicking started task
            setIsPomodoroMinimized(false);
            setIsPomodoroModalOpen(true);
        } else {
            // Check if another task is already running in Redux (chat/room)
            const isReduxRunning = reduxPomodoro.isRunning && reduxPomodoro.activeTask;
            if (isReduxRunning) {
                toast.error(`A Pomodoro is already running for "${reduxPomodoro.activeTask?.title}". Stop it to start a new one.`, {
                    icon: '⏳',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                return;
            }

            // Check if another task is already running locally in TodoPage
            if (activeTaskId && isRunning) {
                const localTitle = activeTask?.title || 'another task';
                toast.error(`A Pomodoro is already running for "${localTitle}". Stop it to start a new one.`, {
                    icon: '⏳',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                return;
            }

            const targetTask = todos.find(t => t.id === id);
            if (targetTask) {
                localStorage.setItem('pomodoro_activeTaskTitle', targetTask.title);
            }
            setActiveTaskId(id);
            setIsPomodoroMinimized(false);
            setIsPomodoroModalOpen(true);
            // It resets automatically via useEffect
        }
    };

    const handleStopTimer = () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-semibold text-white text-center">Are you sure you want to stop the Pomodoro timer?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            pause();
                            setActiveTaskId(null);
                            setIsPomodoroMinimized(false);
                            setIsPomodoroModalOpen(false);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                        Stop
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                background: '#2A2B36',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
            }
        });
    };



    const filteredTodos = todos;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pb-12 relative">


            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">To-Do List</h1>
                    <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">Organize Your Tasks, Track Progress, And Collaborate With Your Study Buddy</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
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
                    <div className="bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 rounded-xl px-4 py-3 flex items-center gap-3.5 shadow-lg shadow-[#8A2BE2]/5 flex-1 sm:flex-initial sm:min-w-[180px]">
                        <div className="bg-[#8A2BE2]/20 p-2 rounded-lg flex items-center justify-center">
                            <span className="text-xl leading-none">⭐</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#8A2BE2] font-bold uppercase tracking-wider mb-0.5">Today's XP</p>
                            <p className="text-white font-bold text-lg flex items-center gap-1.5 leading-none">
                                {dailyXp?.current ?? 0} <span className="text-zinc-500 text-xs font-medium">/ {dailyXp?.cap ?? 50}</span>
                                {dailyXp?.current >= (dailyXp?.cap ?? 50) && <span className="text-green-500 text-sm flex items-center ml-1"><CheckCircle2 size={14} /></span>}
                            </p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className={`${(gamification?.currentStreak ?? 0) > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-zinc-900 border-white/10'} border rounded-xl px-4 py-3 flex items-center gap-3.5 shadow-lg flex-1 sm:flex-initial sm:min-w-[200px] transition-colors`}>
                        <div className={`${(gamification?.currentStreak ?? 0) > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-800 text-zinc-500'} p-2 rounded-lg flex items-center justify-center`}>
                            <Flame size={20} className={(gamification?.currentStreak ?? 0) > 0 ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none mb-1">{gamification?.currentStreak ?? 0} Day Streak</p>
                            <p className="text-zinc-500 text-[9px] font-medium leading-none">Keep it up! Don't break the chain.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid - Full Width */}
            <div className="w-full space-y-8">

                {/* Tasks & Stats */}
                <div className="space-y-8">

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Target size={18} /></div>
                                <span className="text-zinc-400 text-xs sm:text-sm font-medium">Total</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</span>
                        </div>

                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 size={18} /></div>
                                <span className="text-zinc-400 text-xs sm:text-sm font-medium">Done</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.completed}</span>
                        </div>

                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><X size={18} /></div>
                                <span className="text-zinc-400 text-xs sm:text-sm font-medium">Expired</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.expired || 0}</span>
                        </div>

                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><TrendingUp size={18} /></div>
                                <span className="text-zinc-400 text-xs sm:text-sm font-medium">Growth</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.progress}%</span>
                        </div>
                    </div>


                    {/* Main Controls Panel */}
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                <select
                                    value={
                                        filter === 'pending' ? 'Active'
                                        : filter === 'completed' ? 'Completed'
                                        : filter === 'expired' ? 'Expired'
                                        : 'All Tasks'
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        handleFilterChange(e.target.value)
                                    }
                                    className="bg-black border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:ring-2 focus:ring-[blueviolet] outline-none appearance-none cursor-pointer font-medium"
                                >
                                    <option>All Tasks</option>
                                    <option>Active</option>
                                    <option>Completed</option>
                                    <option>Expired</option>
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
                    </div>

                    {/* Task List Panel */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2 sm:p-6 min-h-[400px]">
                        <TodoList
                            todos={filteredTodos}
                            isLoading={isLoading}
                            onToggle={async (id) => {
                                await toggleTodo(id);
                                refreshGamification();
                            }}
                            onDelete={(id) => setTodoToDelete(id)}
                            onEdit={(todo) => {
                                setEditingTodo(todo);
                                setIsAddModalOpen(true);
                            }}
                            activeTaskId={activeTaskId}
                            isTimerRunning={isRunning}
                            onStartTimer={handleStartTimer}
                        />

                        {/* Pagination Controls */}
                        {!isLoading && totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/5">
                                <div className="text-sm text-zinc-400">
                                    Showing <span className="font-semibold text-white">{Math.min(totalItems, (page - 1) * 5 + 1)}</span> to{' '}
                                    <span className="font-semibold text-white">{Math.min(totalItems, page * 5)}</span> of{' '}
                                    <span className="font-semibold text-white">{totalItems}</span> tasks
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    <button
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                            page === 1
                                                ? 'bg-zinc-900/50 border-white/5 text-zinc-600 cursor-not-allowed'
                                                : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-750 hover:border-white/20'
                                        }`}
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                            page === 1
                                                ? 'bg-zinc-900/50 border-white/5 text-zinc-600 cursor-not-allowed'
                                                : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-750 hover:border-white/20'
                                        }`}
                                    >
                                        Prev
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .map((p, idx, arr) => {
                                            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                            return (
                                                <React.Fragment key={p}>
                                                    {showEllipsis && <span className="text-zinc-550 px-1 font-bold">...</span>}
                                                    <button
                                                        onClick={() => setPage(p)}
                                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            page === p
                                                                ? 'bg-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/20 border border-[#8A2BE2]'
                                                                : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-white/10'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}

                                    <button
                                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={page === totalPages}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                            page === totalPages
                                                ? 'bg-zinc-900/50 border-white/5 text-zinc-650 cursor-not-allowed'
                                                : 'bg-zinc-850 border-white/10 text-white hover:bg-zinc-800 hover:border-white/20'
                                        }`}
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                            page === totalPages
                                                ? 'bg-zinc-900/50 border-white/5 text-zinc-650 cursor-not-allowed'
                                                : 'bg-zinc-850 border-white/10 text-white hover:bg-zinc-800 hover:border-white/20'
                                        }`}
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
                existingTitles={todos.filter(t => t.status !== 'EXPIRED').map(t => t.title)}
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
                totalPausedSeconds={totalPausedSeconds}
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
