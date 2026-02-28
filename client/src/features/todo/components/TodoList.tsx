import React from 'react';
import type { TodoItem as TodoItemType } from '../types/todo.types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
    todos: TodoItemType[];
    isLoading: boolean;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (todo: TodoItemType) => void;
    activeTaskId?: string | null;
    isTimerRunning?: boolean;
    onStartTimer?: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, isLoading, onToggle, onDelete, onEdit, activeTaskId, isTimerRunning, onStartTimer }) => {
    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[blueviolet]"></div>
            </div>
        );
    }

    if (todos.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-white font-bold text-lg mb-2">No tasks yet</h3>
                <p className="text-zinc-400 text-sm max-w-sm">
                    You haven't added any tasks to your to-do list yet. Click the "Add Task" button above to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isStarted={activeTaskId === todo.id && isTimerRunning}
                    onStart={onStartTimer}
                />
            ))}
        </div>
    );
};
