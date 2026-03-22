import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { chatApi, type DirectMessageResponseDTO } from '../api/chatApi';
import { socketService } from '../../../shared/services/socketService';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SharedPomodoroPanel } from './SharedPomodoroPanel';
import { clearUnreadCount, setActiveCall } from '../store/chatSlice';

interface MessageWindowProps {
  conversationId: string;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ conversationId }) => {
  const dispatch = useDispatch();
  const authUserSession = localStorage.getItem('authSession');
  const userId = authUserSession ? JSON.parse(authUserSession).id : '';

  const [messages, setMessages] = useState<DirectMessageResponseDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { conversations, onlineUsers } = useSelector((state: RootState) => state.chat);
  const conversation = conversations.find(c => c.id === conversationId);
  const otherUser = conversation?.otherUser;
  const isOnline = otherUser ? onlineUsers[otherUser.userId] : false;

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadMessages = useCallback(async (isInitial = true) => {
    setLoading(true);
    try {
      const oldestMessage = !isInitial && messages.length > 0 ? messages[0] : undefined;
      const res = await chatApi.getMessages(conversationId, 50, oldestMessage?.createdAt);
      if (res.success) {
        const fetchedMessages = res.data.messages.reverse(); // Newest first from API -> Oldest first for UI
        
        if (isInitial) {
          setMessages(fetchedMessages);
          setTimeout(() => scrollToBottom('auto'), 100);
          
          // Emit join:conversations for this explicitly and mark as read
          socketService.emit('join:conversations', [conversationId]);
          chatApi.markAsRead(conversationId);
          dispatch(clearUnreadCount(conversationId));
        } else {
          // Maintain scroll position
          const container = scrollContainerRef.current;
          const previousScrollHeight = container?.scrollHeight || 0;
          
          setMessages(prev => [...fetchedMessages, ...prev]);
          
          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - previousScrollHeight;
            }
          }, 0);
        }
        
        setHasMore(res.data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, messages, dispatch]);

  useEffect(() => {
    loadMessages(true);
  }, [conversationId]);

  useEffect(() => {
    const handleMessage = (msg: DirectMessageResponseDTO) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollToBottom('smooth'), 50);
        // Automatically mark as read
        chatApi.markAsRead(conversationId);
        dispatch(clearUnreadCount(conversationId));
      }
    };

    const handleMessageRead = (data: { conversationId: string, readBy: string }) => {
      if (data.conversationId === conversationId && data.readBy !== userId) {
        setMessages(prev => prev.map(m => 
          m.senderId === userId && m.status !== 'READ' 
            ? { ...m, status: 'READ' } 
            : m
        ));
      }
    };

    socketService.on('chat:message', handleMessage);
    socketService.on('chat:message-read', handleMessageRead);

    return () => {
      socketService.off('chat:message', handleMessage);
      socketService.off('chat:message-read', handleMessageRead);
    };
  }, [conversationId, userId, dispatch]);

  const handleSend = async (content: string) => {
    // Optimistic update
    const optimisticMessage: DirectMessageResponseDTO = {
      id: Date.now().toString(), // temporary
      conversationId,
      senderId: userId,
      fullName: null,
      content,
      messageType: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom('smooth'), 50);

    try {
      const res = await chatApi.sendMessage(conversationId, content);
      if (res.success) {
        // Replace temp message with actual
        setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? res.data : m));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove or mark as failed
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[blueviolet]/10 text-[blueviolet] font-bold text-lg mr-3">
            {otherUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100 leading-tight">
              {otherUser.fullName}
            </h2>
            <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-zinc-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            title="Start Pomodoro" 
            onClick={() => setIsPomodoroOpen(prev => !prev)}
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button 
            title="Start Video Call" 
            onClick={() => dispatch(setActiveCall({ conversationId, isCaller: true }))}
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6" 
        ref={scrollContainerRef}
      >
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => loadMessages(false)} 
              disabled={loading}
              className="text-sm text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === userId;
            // Group logic: show sender info if previous msg is not from same sender
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showSenderInfo = !prevMsg || prevMsg.senderId !== msg.senderId || prevMsg.messageType === 'SYSTEM';

            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={isOwn} 
                showSenderInfo={showSenderInfo}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input & Panels */}
      <SharedPomodoroPanel 
        conversationId={conversationId} 
        isOpen={isPomodoroOpen} 
        onClose={() => setIsPomodoroOpen(false)} 
      />
      <MessageInput onSend={handleSend} />
    </div>
  );
};
