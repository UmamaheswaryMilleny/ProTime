import React from 'react';
import type { DirectMessageResponseDTO } from '../api/chatApi';

interface MessageBubbleProps {
  message: DirectMessageResponseDTO;
  isOwn: boolean;
  showSenderInfo: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showSenderInfo }) => {
  if (message.messageType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs italic text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const date = new Date(message.createdAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
