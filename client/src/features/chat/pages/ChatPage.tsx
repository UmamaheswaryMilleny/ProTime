import React from "react";
import { useParams } from "react-router-dom";
import { ConversationSidebar } from "../components/ConversationSidebar";
import { MessageWindow } from "../components/MessageWindow";

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();

  return (
    <div className="flex h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
      <div className={`w-full md:w-1/3 border-r border-white/5 ${conversationId ? 'hidden md:block' : 'block'}`}>
        <ConversationSidebar />
      </div>

      {/* Message window */}
      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'} h-full`}>
        {conversationId ? (
          <MessageWindow conversationId={conversationId} />
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
