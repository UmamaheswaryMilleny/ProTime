import React, { useEffect, useState } from "react";
import { MessageWindow } from "../components/MessageWindow";
import { chatApi } from "../api/chatApi";
import { Sparkles, Loader2 } from "lucide-react";

export const ProBuddyPage: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      try {
        const result = await chatApi.initProBuddyChat();
        if (result.success && result.data) {
          setConversationId(result.data.id);
        } else {
          setError("Failed to initialize ProBuddy chat.");
        }
      } catch (err) {
        console.error("ProBuddy Init Error:", err);
        setError("Could not connect to ProBuddy. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[blueviolet]" />
        <p className="animate-pulse">Consulting ProBuddy...</p>
      </div>
    );
  }

  if (error || !conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center">
        <div className="p-4 rounded-full bg-red-500/10 mb-4">
          <Sparkles className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">ProBuddy is resting</h2>
        <p className="max-w-md">{error || "Something went wrong while waking up ProBuddy."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header Info */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[blueviolet]/10 to-transparent flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[blueviolet] flex items-center justify-center shadow-lg shadow-[blueviolet]/20">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            ProBuddy AI
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider text-zinc-400">Assistant</span>
          </h1>
          <p className="text-sm text-zinc-400">Ask me anything about your studies or productivity!</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageWindow conversationId={conversationId} isStandaloneAI={true} />
      </div>
    </div>
  );
};
