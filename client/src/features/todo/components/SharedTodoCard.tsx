import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { todoService } from '../services/todo.service';
import type { TodoItem } from '../types/todo.types';

interface SharedTodoCardProps {
  todoId: string;
  initialTodo: TodoItem;
  type: 'chat' | 'room';
  
  // Chat-specific props
  isOwn?: boolean;
  onStartTodoPomodoro?: (todo: TodoItem) => void;
  activeTaskId?: string | null;
  isTimerRunning?: boolean;
  
  // Room-specific props
  isMe?: boolean;
  isHost?: boolean;
  activeTask?: TodoItem | null;
  isRunning?: boolean;
  acceptedTaskIds?: string[];
  ignoredTaskIds?: string[];
  handleAcceptSharedTask?: (todoId: string, title: string) => void;
  handleIgnoreSharedTask?: (todoId: string) => void;
}

export const SharedTodoCard: React.FC<SharedTodoCardProps> = ({
  todoId,
  initialTodo,
  type,
  isOwn,
  onStartTodoPomodoro,
  activeTaskId,
  isTimerRunning,
  isMe,
  isHost,
  activeTask,
  isRunning,
  acceptedTaskIds = [],
  ignoredTaskIds = [],
  handleAcceptSharedTask,
  handleIgnoreSharedTask,
}) => {
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestTodo = async () => {
      try {
        const latestTodo = await todoService.getTodoById(todoId);
        if (!isMounted) return;
        if (!latestTodo) {
          setIsDeleted(true);
        } else {
          setTodo(latestTodo);
        }
      } catch (error) {
        console.error('Failed to fetch shared todo', error);
        // Fallback to initialTodo if fetch fails but is not 404 (e.g. temporary network error)
        if (isMounted) {
          setTodo(initialTodo);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestTodo();
    return () => {
      isMounted = false;
    };
  }, [todoId, initialTodo]);

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 shadow-lg w-full text-left animate-pulse backdrop-blur-md">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
            <div className="h-3 bg-white/5 rounded w-1/2"></div>
          </div>
          <div className="h-5 bg-white/10 rounded w-16"></div>
        </div>
        <div className="flex gap-3 pt-1">
          <div className="h-3 bg-white/5 rounded w-12"></div>
          <div className="h-3 bg-white/5 rounded w-16"></div>
        </div>
        <div className="border-t border-white/5 pt-3 flex justify-end">
          <Loader2 className="w-4 h-4 text-[blueviolet] animate-spin" />
        </div>
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className="bg-zinc-950/80 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-3 shadow-lg w-full text-left backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">Task Unavailable</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              This task (&ldquo;{initialTodo.title}&rdquo;) has been deleted by its owner and is no longer usable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTodo = todo || initialTodo;
  const priorityColor =
    currentTodo.priority === 'HIGH'
      ? 'text-red-500 bg-red-500/10 border-red-500/20'
      : currentTodo.priority === 'MEDIUM'
      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      : 'text-green-500 bg-green-500/10 border-green-500/20';

  const isTimerActive =
    type === 'chat'
      ? activeTaskId === currentTodo.id
      : activeTask?.id === currentTodo.id;

  const isTimerRunningState = type === 'chat' ? isTimerRunning : isRunning;

  return (
    <div
      className={`bg-zinc-900 border transition-all duration-300 p-4 rounded-2xl flex flex-col gap-3 shadow-lg w-full text-left hover:bg-zinc-800/80 ${
        isTimerActive
          ? 'border-[#22c55e]/40 shadow-[#22c55e]/5'
          : 'border-white/10'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{currentTodo.title}</h4>
          {currentTodo.description && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{currentTodo.description}</p>
          )}
        </div>
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap ${priorityColor}`}
        >
          {currentTodo.priority}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium pt-1">
        <span>{currentTodo.estimatedTime} Min</span>
        <span>{currentTodo.pomodoroEnabled ? 'Pomodoro' : 'Standard'}</span>
        <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
          {currentTodo.priority === 'HIGH' ? '5XP' : currentTodo.priority === 'MEDIUM' ? '3XP' : '2XP'}
        </span>
      </div>

      {type === 'chat' && currentTodo.pomodoroEnabled && (
        <div className="border-t border-white/5 pt-3 flex justify-end">
          {isOwn ? (
            <button
              onClick={() => onStartTodoPomodoro && onStartTodoPomodoro(currentTodo)}
              className={`${
                isTimerActive
                  ? isTimerRunningState
                    ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-[blueviolet] hover:bg-[#7c2ae8] text-white shadow-[blueviolet]/20'
              } text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg`}
            >
              {isTimerActive
                ? isTimerRunningState
                  ? 'Started'
                  : 'Paused'
                : 'Start Timer'}
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500 font-medium italic mt-1 pb-1">
              Timer available to owner
            </span>
          )}
        </div>
      )}

      {type === 'room' && (
        <div className="border-t border-white/5 pt-3 flex items-center justify-end gap-2">
          {!isMe && (
            <>
              {acceptedTaskIds.includes(currentTodo.id) ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                  <Check size={12} />
                  Accepted
                </span>
              ) : ignoredTaskIds.includes(currentTodo.id) ? (
                <span className="text-[10px] text-zinc-500 font-medium italic px-2">Ignored</span>
              ) : (
                <>
                  <button
                    onClick={() => handleIgnoreSharedTask && handleIgnoreSharedTask(currentTodo.id)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-400 hover:text-white font-semibold text-xs transition-colors"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() =>
                      handleAcceptSharedTask &&
                      handleAcceptSharedTask(currentTodo.id, currentTodo.title)
                    }
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[blueviolet] hover:bg-[blueviolet]/80 text-white font-semibold text-xs transition-all shadow-lg shadow-[blueviolet]/20"
                  >
                    <Check size={12} />
                    Accept
                  </button>
                </>
              )}
            </>
          )}

          {currentTodo.pomodoroEnabled && isHost && (
            <button
              onClick={() => onStartTodoPomodoro && onStartTodoPomodoro(currentTodo)}
              className={`${
                isTimerActive
                  ? isTimerRunningState
                    ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-[blueviolet] hover:bg-[#7c2ae8] text-white shadow-[blueviolet]/20'
              } text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg`}
            >
              {isTimerActive
                ? isTimerRunningState
                  ? 'Started'
                  : 'Paused'
                : 'Start Timer'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
