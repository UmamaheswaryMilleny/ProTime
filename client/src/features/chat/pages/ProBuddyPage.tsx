import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Loader2, Send, Trash2, Zap, AlertCircle } from "lucide-react";
import { useProBuddyChat } from "../hooks/useProBuddyChat";
import { ProBuddyMessage, ProBuddyLoading } from "../components/ProBuddyMessage";
import { useNavigate } from "react-router-dom";

export const ProBuddyPage: React.FC = () => {
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    clearChat, 
    usage, 
    isPremium 
  } = useProBuddyChat();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const usagePercent = Math.min(100, (usage.count / usage.limit) * 100);
  const isLimitReached = usage.count >= usage.limit;

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
      {/* Header Info */}
      <div className="p-4 sm:p-6 border-b border-white/5 bg-gradient-to-r from-[blueviolet]/10 to-transparent flex items-center justify-between gap-4 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[blueviolet] flex items-center justify-center shadow-lg shadow-[blueviolet]/20">
            <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              ProBuddy AI
              <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Assistant</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">Study smarter, not harder.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Daily Usage</span>
              <span className={`text-xs font-mono font-bold ${isLimitReached ? 'text-red-400' : 'text-[blueviolet]'}`}>
                {usage.count}/{usage.limit}
              </span>
            </div>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-[blueviolet] to-[#7f00ff]'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <button 
            onClick={clearChat}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-sm group"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          {!isPremium && (
            <button 
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-105 transition-all group active:scale-95"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative p-4 pb-0 bg-zinc-950/20">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2 space-y-2 scroll-smooth pb-4"
        >
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-[blueviolet]/10 flex items-center justify-center mb-6 border border-[blueviolet]/20 animate-pulse">
                  <Sparkles className="w-10 h-10 text-[blueviolet]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">How can I help you today?</h3>
                <p className="text-zinc-400 max-w-sm text-sm">
                  Whether it's explaining complex topics or helping with study schedules, I'm here to support your journey.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
                   {[
                     "Explain Quantum Physics like I'm 5",
                     "Create a 4-hour study plan for finals",
                     "Give me productivity tips for focus",
                     "Review my project schedule"
                   ].map(suggestion => (
                     <button 
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="p-3 text-left bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-300 hover:border-[blueviolet]/30 hover:bg-[blueviolet]/5 transition-all"
                     >
                       {suggestion}
                     </button>
                   ))}
                </div>
             </div>
          ) : (
            messages.map((msg) => (
              <ProBuddyMessage key={msg.id} message={msg} />
            ))
          )}
          {loading && <ProBuddyLoading />}
          {error && (
            <div className="flex flex-col items-center gap-2 py-4 animate-in fade-in zoom-in duration-300">
               <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                  {isLimitReached && !isPremium && (
                    <button 
                      onClick={() => navigate('/subscription')}
                      className="ml-2 text-xs font-bold text-amber-500 hover:underline underline-offset-4"
                    >
                      Upgrade now
                    </button>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-zinc-900/80 backdrop-blur-md rounded-t-3xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLimitReached ? "Daily limit reached..." : "Ask ProBuddy anything..."}
                disabled={loading || isLimitReached}
                className="w-full bg-zinc-800/50 text-white text-sm rounded-2xl px-4 py-3 sm:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 focus:bg-zinc-800 transition-all resize-none max-h-32 border border-white/10 group-hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ height: 'auto', minHeight: '48px' }}
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-zinc-500 font-mono hidden sm:block">
                Enter
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || isLimitReached}
              className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-lg active:scale-95 ${
                !input.trim() || loading || isLimitReached
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-[blueviolet] text-white shadow-[blueviolet]/20 hover:scale-105 hover:bg-[#7c2ae8]'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
          <div className="mt-3 flex justify-center md:hidden">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Usage: {usage.count}/{usage.limit}</span>
                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isLimitReached ? 'bg-red-500' : 'bg-[blueviolet]'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
