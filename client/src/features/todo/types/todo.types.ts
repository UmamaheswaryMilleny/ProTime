export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoStatus = 'PENDING' | 'COMPLETED';

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

    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TodoListResponse {
    todos: TodoItem[];
    totalTasks: number;
    completed: number;
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
}

export type UpdateTodoDTO = Partial<CreateTodoDTO>;
