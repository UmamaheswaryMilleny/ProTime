import { useState, useCallback, useEffect, useRef } from 'react';
import type { TodoItem, CreateTodoDTO } from '../types/todo.types';
import { todoService } from '../services/todo.service';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../../store/hooks';
import { addBadgeNotification, updateGamificationLocal } from '../../gamification/store/gamificationSlice';
import { addNotification } from '../../notifications/store/notificationSlice';

export const useTodo = () => {
    const dispatch = useAppDispatch();
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, expired: 0, shared: 0, progress: 0 });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dailyXp, setDailyXp] = useState<{ current: number, cap: number }>({ current: 0, cap: 50 });

    // Track expired task IDs we've already notified about (persisted across re-renders)
    const notifiedExpiredRef = useRef<Set<string>>(new Set(
        JSON.parse(localStorage.getItem('protime_notified_expired') || '[]') as string[]
    ));

    const fetchTodos = useCallback(async (filter: 'all' | 'pending' | 'completed' = 'all') => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await todoService.getTodos(filter);
            setTodos(data.todos);
            setDailyXp({ current: data.todayXp, cap: data.dailyXpCap });
            setStats({
                total: data.totalTasks,
                completed: data.completed,
                expired: data.expired,
                shared: data.shared,
                progress: data.progress
            });

            // Dispatch task_expired notifications for newly-detected expired tasks
            const expiredTodos = data.todos.filter((t: TodoItem) => t.status === 'EXPIRED');
            expiredTodos.forEach((t: TodoItem) => {
                if (!notifiedExpiredRef.current.has(t.id)) {
                    notifiedExpiredRef.current.add(t.id);
                    dispatch(addNotification({
                        type: 'task_expired',
                        title: '⏰ Task Expired',
                        message: `"${t.title}" has expired without being completed.`,
                        metadata: { taskId: t.id },
                    }));
                }
            });
            localStorage.setItem('protime_notified_expired', JSON.stringify([...notifiedExpiredRef.current]));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch todos';
            setError(message);
            toast.error('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    const addTodo = async (dto: CreateTodoDTO) => {
        try {
            const newTodo = await todoService.addTodo(dto);
            setTodos(prev => [newTodo, ...prev]);
            toast.success('Task added successfully');
            return true;
        } catch {
            toast.error('Failed to add task');
            return false;
        }
    };

    const toggleTodo = async (id: string, pomodoroTimeSeconds: number = 0, totalPausedSeconds: number = 0) => {
        const todo = todos.find(t => t.id === id);
        if (!todo || todo.status === 'COMPLETED') return null;

        try {
            // Optimistic update
            setTodos(prev => prev.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t));

            let updatedTodo: TodoItem;
            let earnedXp = 0;

            if (todo.pomodoroEnabled && pomodoroTimeSeconds > 0) {
                const actualPomodoroTime = Math.floor((pomodoroTimeSeconds - totalPausedSeconds) / 60);
                // 1. Complete Pomodoro session
                await todoService.completePomodoro(id, Math.max(0, actualPomodoroTime));

                // 2. Automatically complete the task itself
                const completeResponse = await todoService.completeTodo(id);
                updatedTodo = completeResponse.todo;
                const { xpResult } = completeResponse;

                // 3. Earned XP is total from this action
                earnedXp = xpResult.xpAwarded;

                toast.success(`Pomodoro & Task Complete! Earned ${earnedXp}XP`, {
                    icon: '🚀',
                    duration: 5000
                });

                // Show badge notifications
                if (xpResult.newBadges?.length > 0) {
                    xpResult.newBadges.forEach((badge: any) => {
                        dispatch(addBadgeNotification(badge));
                    });
                }

                // Update local XP state for immediate dashboard refresh
                dispatch(updateGamificationLocal({
                    totalXp: xpResult.totalXp,
                    currentLevel: xpResult.currentLevel,
                    currentTitle: xpResult.currentTitle
                }));

                // Notification: task completed
                dispatch(addNotification({
                    type: 'task_completed',
                    title: '🏆 Task Completed',
                    message: `"${todo.title}" completed with Pomodoro! +${earnedXp} XP`,
                    metadata: { taskId: id, xpAwarded: earnedXp },
                }));

                // Notification: XP gained
                if (earnedXp > 0) {
                    dispatch(addNotification({
                        type: 'xp_gained',
                        title: '⭐ XP Earned',
                        message: `+${earnedXp} XP from Pomodoro session. Total: ${xpResult.totalXp} XP`,
                        metadata: { xpAwarded: earnedXp, totalXp: xpResult.totalXp },
                    }));
                }
            } else {
                const completeResponse = await todoService.completeTodo(id);
                updatedTodo = completeResponse.todo;
                const { xpResult } = completeResponse;

                earnedXp = xpResult.xpAwarded;

                toast.success(`Task Complete! Earned ${earnedXp}XP`, {
                    icon: '⭐',
                    duration: 4000
                });

                // Show badge notifications
                if (xpResult.newBadges?.length > 0) {
                    xpResult.newBadges.forEach((badge: any) => {
                        dispatch(addBadgeNotification(badge));
                    });
                }

                // Update local XP state
                dispatch(updateGamificationLocal({
                    totalXp: xpResult.totalXp,
                    currentLevel: xpResult.currentLevel,
                    currentTitle: xpResult.currentTitle
                }));

                // Notification: task completed
                dispatch(addNotification({
                    type: 'task_completed',
                    title: '🏆 Task Completed',
                    message: `"${todo.title}" completed! +${earnedXp} XP`,
                    metadata: { taskId: id, xpAwarded: earnedXp },
                }));

                // Notification: XP gained
                if (earnedXp > 0) {
                    dispatch(addNotification({
                        type: 'xp_gained',
                        title: '⭐ XP Earned',
                        message: `+${earnedXp} XP earned. Total: ${xpResult.totalXp} XP`,
                        metadata: { xpAwarded: earnedXp, totalXp: xpResult.totalXp },
                    }));
                }

                // Notification: level up
                if (xpResult.leveledUp) {
                    toast.success(`🎉 Level Up! You are now Level ${xpResult.currentLevel}: ${xpResult.currentTitle}`, {
                        duration: 7000,
                        icon: '🎊'
                    });
                    dispatch(addNotification({
                        type: 'level_up',
                        title: '🎉 Level Up!',
                        message: `You reached Level ${xpResult.currentLevel}: ${xpResult.currentTitle}`,
                        metadata: { newLevel: xpResult.currentLevel, newTitle: xpResult.currentTitle },
                    }));
                }
            }

            if (updatedTodo.status === 'COMPLETED') {
                if (!updatedTodo.xpCounted) {
                    toast.success('Task completed — Daily XP limit reached', { duration: 4000 });
                } else if (earnedXp > 0) {
                    // Toast already shown in the conditional blocks above
                } else {
                    toast.success('Task completed!');
                }
            }

            // Sync full state in background
            void fetchTodos();

            return {
                todo: updatedTodo,
                earnedXp,
                capReached: !updatedTodo.xpCounted
            };
        } catch {
            // Revert if failed
            toast.error('Failed to complete task');
            await fetchTodos();
            return null;
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await todoService.deleteTodo(id);
            setTodos(prev => prev.filter(t => t.id !== id));
            toast.success('Task deleted successfully');
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const updateTodo = async (id: string, updates: Partial<CreateTodoDTO>) => {
        try {
            const updatedTodo = await todoService.updateTodo(id, updates);
            setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
            toast.success('Task updated successfully');
            return true;
        } catch {
            toast.error('Failed to update task');
            return false;
        }
    };

    useEffect(() => {
        void fetchTodos();
    }, [fetchTodos]);

    return {
        todos,
        isLoading,
        error,
        stats,
        dailyXp,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
        refresh: fetchTodos
    };
};