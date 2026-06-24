import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO, TodoListResponse, CompleteTodoResponse } from '../types/todo.types';

export const todoService = {
    getTodos: async (
        filter: 'all' | 'pending' | 'completed' | 'expired' = 'all',
        page?: number,
        limit?: number
    ): Promise<TodoListResponse> => {
        let url = `${API_ROUTES.TODO_ROOT}?filter=${filter}`;
        if (page !== undefined) url += `&page=${page}`;
        if (limit !== undefined) url += `&limit=${limit}`;
        const response = await api.get(url);
        return response.data.data;
    },

    getTodoById: async (id: string): Promise<TodoItem | null> => {
        try {
            const response = await api.get(API_ROUTES.TODO_BY_ID(id));
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    },

    addTodo: async (dto: CreateTodoDTO): Promise<TodoItem> => {
        const response = await api.post(API_ROUTES.TODO_ROOT, dto);
        return response.data.data;
    },

    updateTodo: async (id: string, updates: UpdateTodoDTO): Promise<TodoItem> => {
        const response = await api.put(API_ROUTES.TODO_BY_ID(id), updates);
        return response.data.data;
    },

    deleteTodo: async (id: string): Promise<void> => {
        await api.delete(API_ROUTES.TODO_BY_ID(id));
    },

    completeTodo: async (
        id: string,
        metadata?: {
            completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
            completedWithBuddyName?: string | null;
            completedInRoomName?: string | null;
        }
    ): Promise<CompleteTodoResponse> => {
        const response = await api.patch(API_ROUTES.TODO_COMPLETE(id), metadata);
        return response.data.data;
    },

    completePomodoro: async (
        id: string,
        actualPomodoroTime: number,
        metadata?: {
            completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
            completedWithBuddyName?: string | null;
            completedInRoomName?: string | null;
        }
    ): Promise<TodoItem> => {
        const response = await api.patch(API_ROUTES.TODO_POMODORO_COMPLETE(id), {
            actualPomodoroTime,
            ...metadata
        });
        return response.data.data;
    }
};
