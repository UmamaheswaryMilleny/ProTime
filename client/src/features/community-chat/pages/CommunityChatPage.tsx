import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchMessages, sendMessage } from '../store/communitySlice';
import { socketService } from '../../../shared/services/socketService';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { Send, AlertCircle, Loader2, MessageSquare, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommunityChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { messages, isLoading, hasMore, lastFetchedBefore, sending } = useAppSelector(state => state.community);
    const { user } = useAppSelector(state => state.auth);
    
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
    };

    // Initial fetch and Socket connection
    useEffect(() => {
        dispatch(fetchMessages(null));
        if (user?.accessToken) {
            socketService.connect(user.accessToken);
        }
    }, [dispatch, user?.accessToken]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed || sending) return;

        const resultAction = await dispatch(sendMessage(trimmed));
        if (sendMessage.fulfilled.match(resultAction)) {
            setContent('');
        } else if (sendMessage.rejected.match(resultAction)) {
            const errorMsg = resultAction.payload as string;
            if (errorMsg.includes('limit reached')) {
                toast.error('Monthly message limit reached for free users (50 messages).');
            } else {
                toast.error(errorMsg);
            }
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            dispatch(fetchMessages(lastFetchedBefore));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-48px)] bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-zinc-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[blueviolet]/10 rounded-xl text-[blueviolet]">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Community Chat</h2>
                        <p className="text-sm text-zinc-400">Chat with other ProTime members in real-time</p>
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
            >
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="text-xs font-medium text-zinc-400 hover:text-[blueviolet] transition-colors flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                            Load older messages
                        </button>
                    </div>
                )}

                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                        <MessageSquare size={48} className="opacity-20" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.userId === user?.id;
                    return (
                        <div 
                            key={msg.id || idx} 
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`flex items-end gap-2 max-w-[80%]`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">
                                        {msg.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                        {isMe ? 'You' : msg.fullName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                                        isMe 
                                            ? 'bg-[blueviolet] text-white rounded-br-none' 
                                            : 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-bl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/80">
                <form onSubmit={handleSend} className="relative">
                    <input 
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-zinc-200 text-sm focus:outline-none focus:border-[blueviolet]/50 transition-colors"
                        disabled={sending}
                    />
                    
                    <div className="absolute right-[52px] top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={sending}
                            className={`p-2 rounded-lg transition-colors ${
                                showEmojiPicker ? 'text-[blueviolet] bg-[blueviolet]/10' : 'text-zinc-500 hover:text-zinc-300'
                            } disabled:opacity-50`}
                        >
                            <Smile size={18} />
                        </button>
                        
                        {showEmojiPicker && (
                            <div className="absolute bottom-12 right-0 z-50">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    theme={Theme.DARK}
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={!content.trim() || sending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[blueviolet] text-white rounded-lg hover:bg-[blueviolet]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
                {user?.isPremium === false && (
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <AlertCircle size={12} />
                            <span>Free users are limited to 50 messages per month.</span>
                        </div>
                        <span className="font-medium text-[blueviolet]">
                            {useAppSelector(state => state.community.monthlyCount)}/50 used
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
