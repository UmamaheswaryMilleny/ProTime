import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO, TodoListResponse } from '../types/todo.types';

export const todoService = {
    getTodos: async (filter: 'all' | 'pending' | 'completed' = 'all'): Promise<TodoListResponse> => {
        const response = await api.get(`${API_ROUTES.TODO_ROOT}?filter=${filter}`);
        return response.data.data;
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

    completeTodo: async (id: string): Promise<TodoItem> => {
        const response = await api.patch(API_ROUTES.TODO_COMPLETE(id));
        return response.data.data;
    },

    completePomodoro: async (id: string, actualPomodoroTime: number): Promise<TodoItem> => {
        const response = await api.patch(API_ROUTES.TODO_POMODORO_COMPLETE(id), { actualPomodoroTime });
        return response.data.data;
    }
};
