import { ProTimeBackend as api } from '../../../api/instance';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO, TodoListResponse } from '../types/todo.types';

export const todoService = {
    getTodos: async (filter: 'all' | 'pending' | 'completed' = 'all'): Promise<TodoListResponse> => {
        const response = await api.get(`/todos?filter=${filter}`);
        return response.data.data;
    },

    addTodo: async (dto: CreateTodoDTO): Promise<TodoItem> => {
        const response = await api.post('/todos', dto);
        return response.data.data;
    },

    updateTodo: async (id: string, updates: UpdateTodoDTO): Promise<TodoItem> => {
        const response = await api.put(`/todos/${id}`, updates);
        return response.data.data;
    },

    deleteTodo: async (id: string): Promise<void> => {
        await api.delete(`/todos/${id}`);
    },

    completeTodo: async (id: string): Promise<TodoItem> => {
        const response = await api.patch(`/todos/${id}/complete`);
        return response.data.data;
    },

    completePomodoro: async (id: string, actualPomodoroTime: number): Promise<TodoItem> => {
        const response = await api.patch(`/todos/${id}/pomodoro/complete`, { actualPomodoroTime });
        return response.data.data;
    }
};
