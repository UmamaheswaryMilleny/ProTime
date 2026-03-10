import { useState, useCallback, useEffect } from 'react';
import type { TodoItem, CreateTodoDTO } from '../types/todo.types';
import { todoService } from '../services/todo.service';
import toast from 'react-hot-toast';

export const useTodo = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, expired: 0, shared: 0, progress: 0 });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dailyXp, setDailyXp] = useState<{ current: number, cap: number }>({ current: 0, cap: 50 });

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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch todos';
            setError(message);
            toast.error('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                updatedTodo = await todoService.completeTodo(id);

                // 3. Earned XP is base + bonus
                earnedXp = updatedTodo.baseXp + updatedTodo.bonusXp;

                toast.success(`Pomodoro & Task Complete! Earned ${earnedXp}XP`, {
                    icon: '🚀',
                    duration: 5000
                });
            } else {
                updatedTodo = await todoService.completeTodo(id);
                // Use actual XP awarded by the server
                earnedXp = updatedTodo.baseXp + updatedTodo.bonusXp;
                toast.success(`Task Complete! Earned ${earnedXp}XP`, {
                    icon: '⭐',
                    duration: 4000
                });
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