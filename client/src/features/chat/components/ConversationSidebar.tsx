import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { chatApi } from '../api/chatApi';
import { setConversations } from '../store/chatSlice';
import { formatRelativeTime } from '../utils/dateUtils';
import { socketService } from '../../../shared/services/socketService';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface ConversationSidebarProps {
  isMinimized?: boolean;
  onToggle?: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ isMinimized = false, onToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { conversations, onlineUsers } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await chatApi.getConversations();
        if (data.success) {
          dispatch(setConversations(data.data));
          
          // Emit join:conversations
          const allIds = data.data.map(c => c.id);
          if (allIds.length > 0) {
            socketService.emit('join:conversations', allIds);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations', error);
      }
    };
    fetchConversations();
  }, [dispatch]);

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isMinimized ? 'w-24' : 'w-full'}`}>
      <div className={`p-4 border-b border-gray-200 dark:border-gray-800 flex items-center ${isMinimized ? 'justify-center' : 'justify-between'}`}>
        {!isMinimized && <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title={isMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isMinimized ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {sortedConversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 space-y-2">
            <p>No conversations yet.</p>
            <p>Connect with a study buddy to start chatting.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 w-full overflow-hidden block">
            {sortedConversations.map((conv) => {
              const isActive = conv.id === conversationId;
              const { otherUser } = conv;
              const isOnline = onlineUsers[otherUser.userId];
              const initials = otherUser.fullName.charAt(0).toUpperCase();

              let previewText = '';
              if (conv.lastMessageBy) {
                previewText = conv.lastMessageBy === otherUser.userId
                  ? `${otherUser.fullName.split(' ')[0]}: sent a message`
                  : 'You: sent a message';
              }

              return (
                <li
                  key={conv.id}
                  onClick={() => navigate(`/dashboard/chat/${conv.id}`)}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    isActive ? 'bg-indigo-50 dark:bg-gray-800 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'
                  } ${isMinimized ? 'justify-center px-2' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                      {initials}
                    </div>
                    {/* Online Indicator */}
                    <span 
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} 
                      title={isOnline ? "Online" : "Offline"}
                    />
                    {isMinimized && conv.unreadCount > 0 && !isActive && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {!isMinimized && (
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {otherUser.fullName}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatRelativeTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
                          {previewText || 'Say hi to your buddy!'}
                        </p>
                        {conv.unreadCount > 0 && !isActive && (
                          <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-red-500 rounded-full flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
