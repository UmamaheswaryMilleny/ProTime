import React from 'react';
import type { DirectMessageResponseDTO } from '../api/chatApi';
import type { TodoItem } from '../../todo/types/todo.types';

interface MessageBubbleProps {
  message: DirectMessageResponseDTO;
  isOwn: boolean;
  showSenderInfo: boolean;
  onStartTodoPomodoro?: (todo: TodoItem) => void;
  activeTaskId?: string | null;
  isTimerRunning?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showSenderInfo, 
  onStartTodoPomodoro,
  activeTaskId,
  isTimerRunning
}) => {

  if (message.messageType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs italic text-[blueviolet]/70 bg-[blueviolet]/5 border border-[blueviolet]/10 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.messageType === 'AI') {
    return (
      <div className="flex flex-col mb-1 items-start">
        <div className="flex items-center mb-1 ml-1 text-[blueviolet] font-bold text-[10px] uppercase tracking-tighter">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          ProBuddy AI
        </div>
        <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-[blueviolet] to-[#7f00ff] text-white shadow-lg shadow-[blueviolet]/20 rounded-tl-none border border-white/10">
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          </div>
          <div className="flex items-center mt-1 text-[10px] text-zinc-500 justify-start">
             <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(message.createdAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (message.content.startsWith('[TODO_SHARE_DATA]') && message.content.endsWith('[/TODO_SHARE_DATA]')) {
    const jsonStr = message.content.replace('[TODO_SHARE_DATA]', '').replace('[/TODO_SHARE_DATA]', '');
    try {
      const todos = JSON.parse(jsonStr) as TodoItem[];
      return (
        <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && showSenderInfo && message.fullName && (
            <span className="text-xs text-zinc-500 mb-1 ml-1">{message.fullName}</span>
          )}
          <div className="flex flex-col w-full max-w-[85%] sm:max-w-[75%] gap-2 mt-1">
            <div className={`text-xs text-zinc-400 mb-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
              {isOwn ? 'You shared a To-Do list:' : `${message.fullName} shared a To-Do list:`}
            </div>
            {todos.map(todo => {
                const priorityColor = todo.priority === 'HIGH' ? 'text-red-500 bg-red-500/10 border-red-500/20' : todo.priority === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-green-500 bg-green-500/10 border-green-500/20';
                return (
               <div key={todo.id} className="bg-zinc-900 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shadow-lg hover:bg-zinc-800/80 transition-colors w-full text-left">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-white truncate">{todo.title}</h4>
                       {todo.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{todo.description}</p>}
                     </div>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap ${priorityColor}`}>{todo.priority}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium pt-1">
                     <span>{todo.estimatedTime} Min</span>
                     <span>{todo.pomodoroEnabled ? 'Pomodoro' : 'Standard'}</span>
                     <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                         {todo.priority === 'HIGH' ? '5XP' : todo.priority === 'MEDIUM' ? '3XP' : '2XP'}
                     </span>
                  </div>

                  {todo.pomodoroEnabled && (
                     <div className="border-t border-white/5 pt-3 flex justify-end">
                       {isOwn ? (
                          <button 
                            onClick={() => onStartTodoPomodoro && onStartTodoPomodoro(todo)} 
                            className={`${
                              activeTaskId === todo.id
                                ? (isTimerRunning 
                                    ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20' 
                                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20')
                                : 'bg-[blueviolet] hover:bg-[#7c2ae8] text-white shadow-[blueviolet]/20'
                            } text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg`}
                          >
                             {activeTaskId === todo.id 
                               ? (isTimerRunning ? 'Started' : 'Paused') 
                               : 'Start Timer'}
                          </button>
                       ) : (
                          <span className="text-[10px] text-zinc-500 font-medium italic mt-1 pb-1">Timer available to owner</span>
                       )}
                     </div>
                  )}
               </div>
            )})}
          </div>
          <div className={`flex items-center mt-1 text-[10px] text-zinc-500 space-x-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{timeString}</span>
          </div>
        </div>
      );
    } catch(e) {
      console.error('Failed to parse shared todos', e);
    }
  }

  return (
    <div className={`flex flex-col mb-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && showSenderInfo && message.fullName && (
        <span className="text-xs text-gray-500 mb-1 ml-1">{message.fullName}</span>
      )}
      <div className="flex flex-col max-w-[75%] sm:max-w-[60%]">
        <div 
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 text-[10px] text-gray-500 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{timeString}</span>
          {isOwn && (
            <span className="ml-1 flex items-center">
              {message.status === 'SENT' && <span className="text-gray-400">✓</span>}
              {message.status === 'DELIVERED' && <span className="text-gray-400">✓✓</span>}
              {message.status === 'READ' && <span className="text-blue-500">✓✓</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
