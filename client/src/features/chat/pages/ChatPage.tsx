import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { ConversationSidebar } from "../components/ConversationSidebar";
import { MessageWindow } from "../components/MessageWindow";

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { conversations } = useSelector((state: RootState) => state.chat);

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => localStorage.getItem('chat_sidebar_minimized') === 'true');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    localStorage.setItem('chat_sidebar_minimized', isSidebarMinimized.toString());
  }, [isSidebarMinimized]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically redirect to the last active conversation on desktop/tablet
  useEffect(() => {
    if (!conversationId && conversations.length > 0 && window.innerWidth >= 768) {
      const sorted = [...conversations].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      const lastActive = sorted[0];
      if (lastActive) {
        navigate(`/dashboard/chat/${lastActive.id}`, { replace: true });
      }
    }
  }, [conversationId, conversations, navigate]);

  const activeMinimized = isSidebarMinimized && !isMobile;

  return (
    <div className="flex h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
      <div className={`transition-all duration-300 border-r border-white/5 ${conversationId ? 'hidden md:block' : 'block'} w-full flex-shrink-0 ${activeMinimized ? 'md:w-24' : 'md:w-1/3 max-w-sm'}`}>
        <ConversationSidebar 
          isMinimized={activeMinimized} 
          onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)} 
          onBack={() => navigate('/dashboard/find-buddy')}
        />
      </div>

      {/* Message window */}
      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'} h-full`}>
        {conversationId ? (
          <div className="flex flex-col flex-1 h-full relative">
            <div className="flex-1 min-h-0 flex flex-col">
              <MessageWindow conversationId={conversationId} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
