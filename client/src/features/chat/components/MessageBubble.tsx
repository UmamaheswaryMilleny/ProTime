import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import type { DirectMessageResponseDTO } from '../api/chatApi';
import type { TodoItem } from '../../todo/types/todo.types';
import { SharedTodoCard } from '../../todo/components/SharedTodoCard';

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
        <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'} w-full`}>
          {!isOwn && showSenderInfo && message.fullName && (
            <span className="text-xs text-zinc-500 mb-1 ml-1">{message.fullName}</span>
          )}
          <div className="flex flex-col w-full max-w-[85%] sm:max-w-[75%] gap-2 mt-1">
            <div className={`text-xs text-zinc-400 mb-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
              {isOwn ? 'You shared a To-Do list:' : `${message.fullName} shared a To-Do list:`}
            </div>
            {todos.map(todo => (
              <SharedTodoCard
                key={todo.id}
                todoId={todo.id}
                initialTodo={todo}
                type="chat"
                isOwn={isOwn}
                onStartTodoPomodoro={onStartTodoPomodoro}
                activeTaskId={activeTaskId}
                isTimerRunning={isTimerRunning}
              />
            ))}
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

  if (message.messageType === 'IMAGE') {
    return (
      <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showSenderInfo && message.fullName && (
          <span className="text-xs text-zinc-500 mb-1 ml-1">{message.fullName}</span>
        )}
        <div className="flex flex-col max-w-[85%] sm:max-w-[70%] group">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl bg-zinc-900">
            <img 
              src={message.fileUrl} 
              alt={message.fileName || 'Image'} 
              className="w-full h-auto max-h-[400px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content && (
              <div className="p-3 bg-zinc-900/90 border-t border-white/5 backdrop-blur-sm">
                <p className="text-sm text-zinc-100 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              </div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => window.open(message.fileUrl, '_blank')}
                  className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
               >
                  <ExternalLink size={14} />
               </button>
            </div>
          </div>
          <div className={`flex items-center mt-1 text-[10px] text-zinc-500 space-x-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{timeString}</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.messageType === 'FILE') {
    return (
      <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showSenderInfo && message.fullName && (
          <span className="text-xs text-zinc-500 mb-1 ml-1">{message.fullName}</span>
        )}
        <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
          <div 
            className={`flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-lg ${
              isOwn ? 'bg-zinc-900' : 'bg-zinc-800'
            }`}
          >
            <div className="flex items-center p-4 space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{message.fileName}</h4>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5 tracking-wider font-semibold">
                  {message.fileType?.split('/')[1] || 'FILE'} • {message.fileSize ? (message.fileSize / 1024).toFixed(1) : '?'} KB
                </p>
              </div>
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                download={message.fileName}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download size={18} />
              </a>
            </div>
            {message.content && (
              <div className="px-4 py-3 bg-black/30 border-t border-white/5 backdrop-blur-sm">
                <p className="text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              </div>
            )}
          </div>
          <div className={`flex items-center mt-1 text-[10px] text-zinc-500 space-x-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{timeString}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && showSenderInfo && message.fullName && (
        <span className="text-xs text-zinc-500 mb-1 ml-1">{message.fullName}</span>
      )}
      <div className="flex flex-col max-w-[75%] sm:max-w-[60%]">
        <div 
          className={`px-4 py-2 rounded-2xl relative shadow-md ${
            isOwn 
              ? 'bg-[blueviolet] text-white rounded-tr-none border border-white/10' 
              : 'bg-zinc-800 text-white rounded-tl-none border border-white/5'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 text-[10px] text-zinc-500 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{timeString}</span>
          {isOwn && (
            <span className="ml-1 flex items-center">
              {message.status === 'SENT' && <span className="opacity-40">✓</span>}
              {message.status === 'DELIVERED' && <span className="opacity-40">✓✓</span>}
              {message.status === 'READ' && <span className="text-[blueviolet] font-black">✓✓</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
