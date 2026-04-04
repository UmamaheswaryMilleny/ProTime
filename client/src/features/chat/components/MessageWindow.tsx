import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { chatApi, type DirectMessageResponseDTO } from '../api/chatApi';
import { socketService } from '../../../shared/services/socketService';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { clearUnreadCount, setActiveCall, updateConversationPreview } from '../store/chatSlice';
import { MoreVertical, Calendar, PhoneOff, Flag, ListTodo } from 'lucide-react';
import { ReportModal } from './ReportModal';
import { ShareTodoModal } from './ShareTodoModal';
import { ScheduleRecurringSessionModal } from './ScheduleRecurringSessionModal';
import { buddyService } from '../../buddy-match/services/buddy.service';
import type { TodoItem } from '../../todo/types/todo.types';
import { usePomodoro } from '../../todo/hooks/usePomodoro';
import { useGamification } from '../../gamification/hooks/useGamification';
import { PomodoroModal } from '../../todo/components/PomodoroModal';
import { PomodoroMinimized } from '../../todo/components/PomodoroMinimized';
import { PomodoroCompletedModal } from '../../todo/components/PomodoroCompletedModal';
import { fetchPendingRequests, respondToScheduleRequest } from '../../calendar/store/calendarSlice';
import { Check, X as CloseIcon, Bot, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setMinimized, dismissCompletedModal } from '../../todo/store/pomodoroSlice';
import { useAppSelector } from '../../../store/hooks';
import { useProBuddyChat } from '../hooks/useProBuddyChat';

interface MessageWindowProps {
  conversationId: string;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({ conversationId }) => {
  const dispatch = useDispatch();
  const { conversations, onlineUsers, isAILoading } = useSelector((state: RootState) => state.chat);

  // ─── Fix 1: simple selector — no JWT decoding, always reliable ───────────
  const userId = useSelector((state: RootState) => state.auth.user?.id ?? '');

  const pendingRequests = useSelector((state: RootState) => state.calendar?.pendingRequests || []);

  const [messages, setMessages] = useState<DirectMessageResponseDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareTodoOpen, setIsShareTodoOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Persist AI drawer state across refreshes
  const [isAiMode, setIsAiMode] = useState(() => localStorage.getItem(`chat_ai_mode_${conversationId}`) === 'true');
  
  useEffect(() => {
    localStorage.setItem(`chat_ai_mode_${conversationId}`, isAiMode.toString());
  }, [isAiMode, conversationId]);

  const [aiMessage, setAiMessage] = useState('');

  const { messages: aiMessages, loading: aiLoading, sendMessage: sendAiMessage } = useProBuddyChat(`1on1_${conversationId}`);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiLoading, isAiMode]);

  const handleSendAi = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiMessage.trim() || aiLoading) return;
    sendAiMessage(aiMessage);
    setAiMessage('');
  };

  const [isTodoPomodoroModalOpen, setIsTodoPomodoroModalOpen] = useState(false);

  const {
    lastCompletedTask,
    earnedXp: globalEarnedXp,
    showCompletedModal,
    buddyActiveTask,
    buddyTimeRemaining,
    buddyIsRunning,
    buddyConversationId
  } = useAppSelector((state: RootState) => state.pomodoro);

  const { refreshGamification } = useGamification();

  const {
    activeTask,
    timeRemaining,
    timeRemainingFormatted,
    isRunning: isTodoRunning,
    phase,
    initialTime,
    isSmartBreaksEnabled,
    totalPausedSeconds,
    start: startTodoTimer,
    pause: pauseTodoTimer,
    resume: resumeTodoTimer,
    stop: stopTodoTimer,
    skipBreak,
    reset: resetTodoTimer
  } = usePomodoro();

  const handleStartTodoPomodoro = (todo: TodoItem) => {
    if (activeTask?.id && isTodoRunning && activeTask.id !== todo.id) {
      toast.error('A Pomodoro is already running. Finish it first.');
      return;
    }
    startTodoTimer(todo, 25 * 60, conversationId);
    setIsTodoPomodoroModalOpen(true);
  };

  const handleStopTodoPomodoro = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm font-medium text-zinc-900 text-center">Stop the Pomodoro timer?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              stopTodoTimer(conversationId);
              setIsTodoPomodoroModalOpen(false);
            }}
            className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            Stop
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const handleMinimizeTodoPomodoro = () => {
    setIsTodoPomodoroModalOpen(false);
    dispatch(setMinimized(true));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const conversation = conversations.find(c => c.id === conversationId);
  const otherUser = conversation?.otherUser;
  const isOnline = otherUser ? onlineUsers[otherUser.userId] : false;

  const relevantRequest = pendingRequests.find(req => req.proposedBy === otherUser?.userId);

  const handleRespondSchedule = async (requestId: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await dispatch(respondToScheduleRequest({ requestId, status }) as any).unwrap();
      toast.success(`Schedule request ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to respond to schedule request');
    }
  };

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadMessages = useCallback(async (isInitial = true) => {
    setLoading(true);
    try {
      const oldestMessage = !isInitial && messages.length > 0 ? messages[0] : undefined;
      const res = await chatApi.getMessages(conversationId, 50, oldestMessage?.createdAt);
      if (res.success) {
        const fetchedMessages = [...res.data.messages].reverse();

        if (isInitial) {
          setMessages(fetchedMessages);
          setTimeout(() => scrollToBottom('auto'), 100);

          socketService.emit('join:conversations', [conversationId]);
          chatApi.markAsRead(conversationId);
          dispatch(clearUnreadCount(conversationId));
        } else {
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
    dispatch(fetchPendingRequests() as any);

    socketService.emit('chat:enter', conversationId);
    return () => {
      socketService.emit('chat:leave', conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleMessage = (msg: DirectMessageResponseDTO) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollToBottom('smooth'), 50);
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
    // ─── Fix 3: guard before sending — userId must be available ─────────────
    if (!userId) {
      toast.error('Unable to send message — please refresh the page');
      return;
    }

    const optimisticMessage: DirectMessageResponseDTO = {
      id: Date.now().toString(),
      conversationId,
      senderId: userId,   // ← guaranteed non-empty due to guard above
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
        setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? res.data : m));
        dispatch(updateConversationPreview({
          conversationId,
          lastMessageBy: userId,
          lastMessageByName: 'You',
          lastMessageContent: res.data.content,
          lastMessageAt: res.data.createdAt,
          incrementUnread: false
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleUnblock = async () => {
    if (!conversation) return;
    try {
      await buddyService.unblockUser(conversation.buddyConnectionId);
      setIsBlocked(false);
      toast.success('User unblocked successfully');
    } catch (error) {
      toast.error('Failed to unblock user');
      console.error(error);
    }
  };

  const handleShareTodos = (todos: TodoItem[]) => {
    const payload = JSON.stringify(todos);
    const message = `[TODO_SHARE_DATA]${payload}[/TODO_SHARE_DATA]`;
    handleSend(message);
    setIsShareTodoOpen(false);
  };

  if (!otherUser) return null;

  return (
    <div className="flex h-full w-full bg-transparent overflow-hidden relative">
      <div className="flex flex-col flex-1 h-full min-w-0">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[blueviolet]/10 text-[blueviolet] font-bold text-lg mr-3">
              {otherUser?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 leading-tight">
                {otherUser?.fullName}
              </h2>
              <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-zinc-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {buddyActiveTask && buddyConversationId === conversationId ? (
              <PomodoroMinimized
                isVisible={true}
                timeRemainingFormatted={(() => {
                  const mins = Math.floor(buddyTimeRemaining / 60);
                  const secs = buddyTimeRemaining % 60;
                  return `${mins}:${secs.toString().padStart(2, '0')}`;
                })()}
                isRunning={buddyIsRunning}
                onStart={() => { }}
                onPause={() => { }}
                onStop={() => { }}
                onMaximize={() => { }}
                readOnly={true}
              />
            ) : activeTask ? (
              <PomodoroMinimized
                isVisible={true}
                timeRemainingFormatted={timeRemainingFormatted}
                isRunning={isTodoRunning}
                onStart={() => resumeTodoTimer(conversationId)}
                onPause={() => pauseTodoTimer(conversationId)}
                onStop={handleStopTodoPomodoro}
                onMaximize={() => setIsTodoPomodoroModalOpen(true)}
              />
            ) : null}
            <button
              title="Start Video Call"
              onClick={() => dispatch(setActiveCall({ conversationId, isCaller: true }))}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setIsAiMode(!isAiMode)}
              className={`p-2 transition-colors rounded-full ${
                isAiMode 
                  ? 'bg-[blueviolet]/20 text-[blueviolet]' 
                  : 'text-gray-500 hover:text-[blueviolet]'
              }`}
              title="Toggle ProBuddy AI"
            >
              <Bot className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsShareTodoOpen(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              title="Share To-Do List"
            >
              <ListTodo className="w-6 h-6" />
            </button>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full"
                title="Settings"
              >
                <MoreVertical className="w-6 h-6" />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-zinc-800 border border-white/5 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsScheduleModalOpen(true);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors gap-3"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule</span>
                    </button>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors gap-3"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Call</span>
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsReportModalOpen(true);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors gap-3 font-medium"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                    <button
                      onClick={() => {
                        toast((t) => (
                          <div className="flex flex-col gap-3 p-1">
                            <p className="text-sm font-medium text-zinc-900">Are you sure you want to delete all messages?</p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  toast.dismiss(t.id);
                                  try {
                                    const res = await chatApi.deleteChat(conversationId);
                                    if (res.success) {
                                      setMessages([]);
                                      setIsSettingsOpen(false);
                                      toast.success("Chat history deleted", { id: 'delete-success' });
                                    }
                                  } catch (err: any) {
                                    const backendMessage = err?.response?.data?.message;
                                    toast.error(backendMessage || "Failed to delete chat history");
                                  }
                                }}
                                className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ), { duration: 5000, position: 'top-center' });
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors gap-3 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Chat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 relative"
        ref={scrollContainerRef}
      >
        {relevantRequest && (
          <div className="mb-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-indigo-400 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Request
              </h4>
              <p className="text-sm text-zinc-300">
                {relevantRequest.proposerName} wants to schedule session(s) starting <span className="font-semibold text-white">{new Date(relevantRequest.scheduledAt).toLocaleString()}</span>
                {relevantRequest.recurringDates && relevantRequest.recurringDates.length > 1 && ` for ${relevantRequest.recurringDates.length} days.`}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleRespondSchedule(relevantRequest.id, 'CONFIRMED')}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => handleRespondSchedule(relevantRequest.id, 'REJECTED')}
                className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <CloseIcon className="w-4 h-4" /> Decline
              </button>
            </div>
          </div>
        )}

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
            // ─── Fix 2: simple direct comparison — no String() cast ──────────
            const isOwn = userId !== '' && msg.senderId === userId;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showSenderInfo = !prevMsg || prevMsg.senderId !== msg.senderId || prevMsg.messageType === 'SYSTEM';

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showSenderInfo={showSenderInfo}
                onStartTodoPomodoro={handleStartTodoPomodoro}
                activeTaskId={activeTask?.id}
                isTimerRunning={isTodoRunning}
              />
            );
          })}

          {isAILoading && (
            <div className="flex flex-col items-start mb-4">
              <div className="flex items-center mb-1 ml-1 text-[blueviolet] font-bold text-[10px] uppercase tracking-tighter animate-pulse">
                ProBuddy is thinking...
              </div>
              <div className="px-4 py-3 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-400 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>


      {isReportModalOpen && otherUser && (
        <ReportModal
          reportedId={otherUser.userId}
          onClose={() => setIsReportModalOpen(false)}
          // ─── Fix 4: no auto-block — just show success toast and close ────
          onSuccess={() => {
            toast.success('Report submitted. Our team will review it.');
            setIsReportModalOpen(false);
          }}
        />
      )}

      <ShareTodoModal
        isOpen={isShareTodoOpen}
        onClose={() => setIsShareTodoOpen(false)}
        onShare={handleShareTodos}
      />

      {isScheduleModalOpen && (
        <ScheduleRecurringSessionModal
          conversationId={conversationId}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      {isBlocked ? (
        <div className="p-4 bg-zinc-900 border-t border-red-500/20 flex flex-col items-center justify-center">
          <p className="text-red-400 text-sm font-medium mb-3">You have blocked this user.</p>
          <button
            onClick={handleUnblock}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
          >
            Unblock User
          </button>
        </div>
      ) : (
        <MessageInput onSend={handleSend} disabled={isAILoading} />
      )}

      <PomodoroModal
        isOpen={isTodoPomodoroModalOpen}
        task={activeTask}
        timeRemainingFormatted={timeRemainingFormatted}
        isRunning={isTodoRunning}
        onStart={resumeTodoTimer}
        onPause={pauseTodoTimer}
        onReset={resetTodoTimer}
        onMinimize={handleMinimizeTodoPomodoro}
        onClose={handleStopTodoPomodoro}
        progressPercentage={initialTime > 0 ? (timeRemaining / initialTime) * 100 : 100}
        phase={phase}
        onSkipBreak={skipBreak}
        isSmartBreaksEnabled={isSmartBreaksEnabled}
        totalPausedSeconds={totalPausedSeconds}
      />

      <PomodoroCompletedModal
        isOpen={showCompletedModal}
        task={lastCompletedTask}
        earnedXp={globalEarnedXp}
        onClose={() => {
          dispatch(dismissCompletedModal());
          refreshGamification();
        }}
      />
      </div>

      {isAiMode && (
        <div className="w-80 border-l border-white/10 bg-zinc-900/60 flex flex-col h-full animate-in slide-in-from-right-2 duration-300 relative z-10 flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Bot size={16} className="text-[blueviolet]" />
              ProBuddy AI
            </div>
            <button
              onClick={() => setIsAiMode(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {aiMessages.length === 0 && (
              <div className="flex flex-col gap-1.5 items-start">
                <div className="bg-zinc-800/80 border border-white/5 rounded-2xl p-3 text-xs text-zinc-300 leading-relaxed rounded-bl-none shadow-lg">
                  Hello! Need help answering a question, summarizing topics, or keeping track of your thoughts during this chat? 🚀
                </div>
              </div>
            )}
            
            {aiMessages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`${
                  m.role === 'user'
                    ? 'bg-[blueviolet]/20 border border-[blueviolet]/20 text-zinc-200 rounded-br-none'
                    : 'bg-zinc-800/80 border border-white/5 text-zinc-300 rounded-bl-none'
                  } rounded-2xl p-3 text-xs leading-relaxed max-w-[90%] shadow-lg`}
                >
                  {m.content}
                </div>
                <span className={`text-[9px] text-zinc-600 ${m.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {aiLoading && (
              <div className="flex flex-col gap-1.5 items-start">
                <div className="bg-zinc-800/80 border border-white/5 rounded-2xl px-4 py-3 text-xs text-zinc-300 rounded-bl-none shadow-lg flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[blueviolet]" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={aiScrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendAi} className="p-4 border-t border-white/10 bg-zinc-900/80">
            <div className="relative">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask ProBuddy..."
                disabled={aiLoading}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-all border-b border-b-[blueviolet]/30 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!aiMessage.trim() || aiLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[blueviolet] text-white hover:bg-[blueviolet]/80 transition-colors disabled:opacity-50"
              >
                <Play size={10} className="fill-current" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};