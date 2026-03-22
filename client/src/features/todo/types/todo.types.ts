export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

export interface TodoItem {
    id: string;
    title: string;
    description?: string;
    priority: TodoPriority;
    estimatedTime: number;
    status: TodoStatus;

    pomodoroEnabled: boolean;
    pomodoroCompleted: boolean;
    actualPomodoroTime?: number;
    smartBreaks?: boolean;

    baseXp: number;
    bonusXp: number;
    xpCounted: boolean;

    isShared: boolean;
    sharedWith: string[];

    expiryDate?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TodoListResponse {
    todos: TodoItem[];
    totalTasks: number;
    completed: number;
    expired: number;
    shared: number;
    progress: number;
    todayXp: number;
    dailyXpCap: number;
}

export interface CreateTodoDTO {
    title: string;
    description?: string;
    priority: TodoPriority;
    estimatedTime: number;
    pomodoroEnabled: boolean;
    smartBreaks?: boolean;
    expiryDate?: string | null;
}

import type { AwardXpResponse } from "../../gamification/types/gamification.types";

export type UpdateTodoDTO = Partial<CreateTodoDTO>;

export interface CompleteTodoResponse {
    todo: TodoItem;
    xpResult: AwardXpResponse;
}
