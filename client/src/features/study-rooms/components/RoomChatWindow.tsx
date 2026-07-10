import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile, Send, Users, Settings, Video, Timer, Bot, UserCheck, X, Check, ChevronLeft, User, AlertTriangle, Paperclip, Download, FileText, Image as ImageIcon, UserMinus, Plus, UserPlus, ListTodo, Pause, Play } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { sendRoomMessage, fetchPendingRequests, respondToJoinRequest, startGroupCall, endGroupCall, endRoom, leaveRoom, startRoom, kickUser, inviteToRoom, fetchRoomById, setIncomingGroupCall } from '../store/studyRoomSlice';
import { pausePomodoro, resumePomodoro, startPomodoro, stopPomodoro, updateTime, setPhase } from '../../todo/store/pomodoroSlice';
import type { TimerPhase } from '../../todo/store/pomodoroSlice';
import { socketService } from '../../../shared/services/socketService';
// import { todoService } from '../../todo/services/todo.service';
import { ReportModal } from '../../chat/components/ReportModal';
import { ReportContext } from '../../chat/api/chatApi';
import type { RoomMessageDTO } from '../api/studyRoomApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';
import { buddyService } from '../../buddy-match/services/buddy.service';
import type { BuddyConnection } from '../../buddy-match/types/buddy.types';
import { ShareTodoModal } from '../../chat/components/ShareTodoModal';
import type { TodoItem } from '../../todo/types/todo.types';
import { SharedTodoCard } from '../../todo/components/SharedTodoCard';

interface RoomChatWindowProps {
  roomId: string;
  isAiMode: boolean;
  setIsAiMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoomChatWindow: React.FC<RoomChatWindowProps> = ({ roomId, isAiMode, setIsAiMode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRoom, messages, isSending, pendingRequests, isInGroupCall, incomingGroupCall } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);
  const { activeTask, isRunning, timeRemaining, phase } = useAppSelector(s => s.pomodoro);
  const { activeCall } = useAppSelector(s => s.chat);


  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showReportList, setShowReportList] = useState(false);
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Buddy invitation states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [buddies, setBuddies] = useState<BuddyConnection[]>([]);
  const [isLoadingBuddies, setIsLoadingBuddies] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [invitingIds, setInvitingIds] = useState<string[]>([]);

  const [isShareTodoOpen, setIsShareTodoOpen] = useState(false);
  const [pomodoroOffer, setPomodoroOffer] = useState<{
    task: TodoItem;
    duration: number;
    startedByName: string;
  } | null>(null);

  const [lateJoinOffer, setLateJoinOffer] = useState<{
    task: TodoItem;
    timeRemaining: number;
    phase: TimerPhase;
  } | null>(null);

  const [statsSummary, setStatsSummary] = useState<{
    participantsCount: number;
    tasksCompletedCount: number;
    pomodorosEarnedCount: number;
  } | null>(null);

  const [hasAcceptedFocusSession, setHasAcceptedFocusSession] = useState(false);
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<string[]>([]);
  const [ignoredTaskIds, setIgnoredTaskIds] = useState<string[]>([]);
  const acceptedTaskIdsRef = useRef<string[]>([]);
  const ignoredTaskIdsRef = useRef<string[]>([]);
  acceptedTaskIdsRef.current = acceptedTaskIds;
  ignoredTaskIdsRef.current = ignoredTaskIds;
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [sessionExtensionSeconds, setSessionExtensionSeconds] = useState(() => {
    const saved = sessionStorage.getItem(`session_extension_${roomId}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const sessionEndPromptShownRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHostCallActive, setIsHostCallActive] = useState(false);
  const [showRingingOverlay, setShowRingingOverlay] = useState(false);
  const isHost = activeRoom?.hostId === user?.id;

  console.log('[RoomChatWindow] Render states:', { isHost, isHostCallActive, showRingingOverlay, isInGroupCall, roomId });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!document.body.contains(target)) {
        return; // Ignore clicks on detached elements
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const participantCount = activeRoom ? activeRoom.participantIds.length : 0;
  const reportableParticipants = activeRoom?.participants?.filter(p => p.id !== user?.id) || [];
  const isExpired = activeRoom?.status === 'WAITING' && activeRoom?.endTime && new Date(activeRoom.endTime) < currentTime;
  const isRoomEnded = activeRoom?.status === 'ENDED' || isExpired;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isHost && roomId) {
      dispatch(fetchPendingRequests(roomId));
    }
  }, [isHost, roomId, dispatch]);

  const handleAcceptFocusSession = (offer: { task: TodoItem, duration: number }) => {
    dispatch(startPomodoro({
      task: offer.task,
      duration: offer.duration,
      phase: 'FOCUS',
      isSmartBreaksEnabled: true,
      conversationId: roomId,
      conversationType: 'ROOM',
      isRoomHost: false
    }));
    setHasAcceptedFocusSession(true);
    socketService.emit('room:pomodoro:accept', { roomId });
    setPomodoroOffer(null);
  };

  const handleIgnoreFocusSession = () => {
    setPomodoroOffer(null);
  };

  const handleJoinLateFocusSession = (offer: { task: TodoItem, timeRemaining: number }) => {
    dispatch(startPomodoro({
      task: offer.task,
      duration: offer.timeRemaining,
      phase: 'FOCUS',
      isSmartBreaksEnabled: true,
      conversationId: roomId,
      conversationType: 'ROOM',
      isRoomHost: false
    }));
    setHasAcceptedFocusSession(true);
    socketService.emit('room:pomodoro:accept', { roomId });
    setLateJoinOffer(null);
  };

  const handleSkipLateFocusSession = () => {
    setLateJoinOffer(null);
  };

  // Socket Listeners for Room Pomodoro Synchronization
  useEffect(() => {
    const handleRoomPomodoroStart = (payload: { task: TodoItem, duration: number, startedBy: string, startedByName: string, phase?: TimerPhase }) => {
      if (payload.startedBy !== user?.id) {
        if (payload.phase === 'BREAK' || payload.task.title.includes('Group Break:')) {
          if (hasAcceptedFocusSession) {
            dispatch(startPomodoro({
              task: payload.task,
              duration: payload.duration,
              phase: 'BREAK',
              isSmartBreaksEnabled: true,
              conversationId: roomId,
              conversationType: 'ROOM',
              isRoomHost: false
            }));
            toast.success('Focus session complete! Entering 5-minute group break. ☕');
            setHasAcceptedFocusSession(false);
          }
        } else {
          const taskId = payload.task.id;
          if (acceptedTaskIdsRef.current.includes(taskId)) {
            // User pre-accepted this task card — auto-start timer silently
            dispatch(startPomodoro({
              task: payload.task,
              duration: payload.duration,
              phase: 'FOCUS',
              isSmartBreaksEnabled: true,
              conversationId: roomId,
              conversationType: 'ROOM',
              isRoomHost: false
            }));
            setHasAcceptedFocusSession(true);
            socketService.emit('room:pomodoro:accept', { roomId });
            toast.success(`🎯 Timer started for "${payload.task.title}"!`);
          } else if (ignoredTaskIdsRef.current.includes(taskId)) {
            // User ignored this task — do nothing
          } else {
            // No pre-decision — show invitation modal as fallback
            setPomodoroOffer({
              task: payload.task,
              duration: payload.duration,
              startedByName: payload.startedByName
            });
          }
        }
      }
    };

    const handleRoomPomodoroPause = () => {
      if (!isHost && activeTask) {
        dispatch(pausePomodoro());
      }
    };

    const handleRoomPomodoroResume = () => {
      if (!isHost && activeTask) {
        dispatch(resumePomodoro());
      }
    };

    const handleRoomPomodoroStop = () => {
      if (!isHost && activeTask) {
        dispatch(stopPomodoro());
      }
    };

    const handleRoomPomodoroTick = (payload: { timeRemaining: number, phase: TimerPhase }) => {
      if (!isHost && activeTask) {
        if (Math.abs(timeRemaining - payload.timeRemaining) > 2) {
          dispatch(updateTime(payload.timeRemaining));
        }
        if (phase !== payload.phase) {
          dispatch(setPhase({ phase: payload.phase, duration: payload.timeRemaining }));
        }
      }
    };

    const handleRoomPomodoroRequestStatus = (payload: { requesterId: string }) => {
      if (isHost && activeTask) {
        socketService.emit('room:pomodoro:status-response', {
          targetSocketId: payload.requesterId,
          task: activeTask,
          timeRemaining,
          isRunning,
          phase
        });
      }
    };

    const handleRoomPomodoroStatusResponse = (payload: { task: TodoItem, timeRemaining: number, isRunning: boolean, phase: TimerPhase, isAccepted?: boolean }) => {
      if (!isHost && !activeTask && payload.timeRemaining > 0 && payload.phase === 'FOCUS') {
        setLateJoinOffer({
          task: payload.task,
          timeRemaining: payload.timeRemaining,
          phase: payload.phase
        });
      }
    };

    const handleRoomPomodoroSummary = (payload: { participantsCount: number, tasksCompletedCount: number, pomodorosEarnedCount: number }) => {
      setStatsSummary(payload);
    };

    const handleRoomStarted = (payload: { roomId: string }) => {
      if (payload.roomId === roomId) {
        dispatch(fetchRoomById(roomId));
        toast.success('Study session has started! 🎯');
      }
    };


    socketService.on('room:pomodoro:start', handleRoomPomodoroStart);
    socketService.on('room:pomodoro:pause', handleRoomPomodoroPause);
    socketService.on('room:pomodoro:resume', handleRoomPomodoroResume);
    socketService.on('room:pomodoro:stop', handleRoomPomodoroStop);
    socketService.on('room:pomodoro:tick', handleRoomPomodoroTick);
    socketService.on('room:pomodoro:request-status', handleRoomPomodoroRequestStatus);
    socketService.on('room:pomodoro:status-response', handleRoomPomodoroStatusResponse);
    socketService.on('room:pomodoro:summary', handleRoomPomodoroSummary);
    socketService.on('room:started', handleRoomStarted);

    if (!isHost && roomId) {
      const t = setTimeout(() => {
        socketService.emit('room:pomodoro:request-status', { roomId });
      }, 500);
      return () => {
        clearTimeout(t);
        socketService.off('room:pomodoro:start', handleRoomPomodoroStart);
        socketService.off('room:pomodoro:pause', handleRoomPomodoroPause);
        socketService.off('room:pomodoro:resume', handleRoomPomodoroResume);
        socketService.off('room:pomodoro:stop', handleRoomPomodoroStop);
        socketService.off('room:pomodoro:tick', handleRoomPomodoroTick);
        socketService.off('room:pomodoro:request-status', handleRoomPomodoroRequestStatus);
        socketService.off('room:pomodoro:status-response', handleRoomPomodoroStatusResponse);
        socketService.off('room:pomodoro:summary', handleRoomPomodoroSummary);
        socketService.off('room:started', handleRoomStarted);
      };
    }

    return () => {
      socketService.off('room:pomodoro:start', handleRoomPomodoroStart);
      socketService.off('room:pomodoro:pause', handleRoomPomodoroPause);
      socketService.off('room:pomodoro:resume', handleRoomPomodoroResume);
      socketService.off('room:pomodoro:stop', handleRoomPomodoroStop);
      socketService.off('room:pomodoro:tick', handleRoomPomodoroTick);
      socketService.off('room:pomodoro:request-status', handleRoomPomodoroRequestStatus);
      socketService.off('room:pomodoro:status-response', handleRoomPomodoroStatusResponse);
      socketService.off('room:pomodoro:summary', handleRoomPomodoroSummary);
      socketService.off('room:started', handleRoomStarted);
    };
  }, [roomId, isHost, activeTask, isRunning, timeRemaining, phase, dispatch, user?.id, hasAcceptedFocusSession]);

  // ── Dedicated stable video-call socket listeners (not re-run every timer tick) ──
  useEffect(() => {
    if (!roomId) return;

    const handleVideoStarted = (payload: { roomId: string }) => {
      console.log('[Socket] room:video:started received on client:', payload);
      if (payload.roomId !== roomId) return;
      setIsHostCallActive(true);
      if (!isHost) setShowRingingOverlay(true);
    };

    const handleVideoEnded = (payload: { roomId: string }) => {
      console.log('[Socket] room:video:ended received on client:', payload);
      if (payload.roomId !== roomId) return;
      setIsHostCallActive(false);
      setShowRingingOverlay(false);
      sessionStorage.removeItem(`in_group_call_${roomId}`);
      sessionStorage.removeItem(`declined_video_call_${roomId}`);
      // If member was in the call, close their overlay too
      dispatch(endGroupCall());
    };

    const handleVideoStatusResponse = (payload: { roomId: string; isActive: boolean }) => {
      console.log('[Socket] room:video:status-response received on client:', payload);
      if (payload.roomId !== roomId) return;
      setIsHostCallActive(payload.isActive);
      
      const wasInCall = sessionStorage.getItem(`in_group_call_${roomId}`) === 'true';
      const hasDeclined = sessionStorage.getItem(`declined_video_call_${roomId}`) === 'true';
      if (payload.isActive) {
        if (wasInCall) {
          console.log('[Refreshed] User was in the call, auto-rejoining');
          dispatch(startGroupCall(roomId));
        } else if (!isHost && !isInGroupCall && !hasDeclined) {
          setShowRingingOverlay(true);
        }
      } else {
        sessionStorage.removeItem(`in_group_call_${roomId}`);
        sessionStorage.removeItem(`declined_video_call_${roomId}`);
      }
    };

    socketService.on('room:video:started', handleVideoStarted);
    socketService.on('room:video:ended', handleVideoEnded);
    socketService.on('room:video:status-response', handleVideoStatusResponse);

    // Query call status on mount
    const t = setTimeout(() => {
      socketService.emit('room:video:request-status', { roomId });
    }, 600);

    return () => {
      clearTimeout(t);
      socketService.off('room:video:started', handleVideoStarted);
      socketService.off('room:video:ended', handleVideoEnded);
      socketService.off('room:video:status-response', handleVideoStatusResponse);
    };
  }, [roomId, dispatch, isHost, isInGroupCall]);

  // Host: Emit time remaining tick every 5 seconds to room
  useEffect(() => {
    if (isHost && activeTask && isRunning && timeRemaining % 5 === 0) {
      socketService.emit('room:pomodoro:tick', {
        roomId,
        timeRemaining,
        phase
      });
    }
  }, [isHost, activeTask, isRunning, timeRemaining, phase, roomId]);

  // Host: Auto-start a 5 minute break session when Focus timer reaches 0
  useEffect(() => {
    if (isHost && activeTask && isRunning && timeRemaining === 0 && phase === 'FOCUS') {
      const t = setTimeout(() => {
        const breakTask: TodoItem = {
          id: `study-room-break-${roomId}-${Date.now()}`,
          title: `Group Break: 5 Min`,
          description: 'Study room group session break timer',
          status: 'IN_PROGRESS',
          priority: 'LOW',
          estimatedPomodoros: 1,
          completedPomodoros: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any;
        dispatch(startPomodoro({
          task: breakTask,
          duration: 5 * 60,
          phase: 'BREAK',
          isSmartBreaksEnabled: true,
          conversationId: roomId,
          conversationType: 'ROOM',
          isRoomHost: true
        }));
        socketService.emit('room:pomodoro:start', {
          roomId,
          task: breakTask,
          duration: 5 * 60,
          phase: 'BREAK',
          startedByName: user?.fullName || 'Host'
        });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isHost, activeTask, isRunning, timeRemaining, phase, roomId, dispatch, user?.fullName]);

  // Participant: Emit completion stats when timer finishes at 0
  useEffect(() => {
    if (!isHost && activeTask && isRunning && timeRemaining === 0 && phase === 'FOCUS' && hasAcceptedFocusSession) {
      socketService.emit('room:pomodoro:finish-timer', { roomId });
      socketService.emit('room:pomodoro:complete-task', { roomId });
      setHasAcceptedFocusSession(false);
    }
  }, [isHost, activeTask, isRunning, timeRemaining, phase, roomId, hasAcceptedFocusSession]);

  // 30 Minutes general study session timer countdown (starts when room status becomes LIVE)
  useEffect(() => {
    if (activeRoom?.status !== 'LIVE') {
      setSessionTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const startTime = activeRoom.sessionStartedAt || activeRoom.updatedAt || activeRoom.createdAt;
      const startTimeMs = new Date(startTime).getTime();
      const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
      const remaining = Math.max(0, 30 * 60 + sessionExtensionSeconds - elapsedSeconds);
      return remaining;
    };

    // Reset prompt flag whenever extension changes
    sessionEndPromptShownRef.current = false;

    // Set initial remaining time
    setSessionTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setSessionTimeRemaining(remaining);

      if (remaining <= 0 && !sessionEndPromptShownRef.current) {
        clearInterval(interval);
        sessionEndPromptShownRef.current = true;

        if (isHost) {
          // Show persistent decision prompt for host
          toast(
            (t) => (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm font-bold text-zinc-100">30-minute session is over!</p>
                    <p className="text-xs text-zinc-400 mt-0.5">What would you like to do next?</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    onClick={async () => {
                      toast.dismiss(t.id);
                      try {
                        sessionStorage.removeItem(`session_extension_${roomId}`);
                        await dispatch(endRoom(roomId)).unwrap();
                        navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
                      } catch (e: any) {
                        toast.error(e || 'Failed to end room');
                      }
                    }}
                  >
                    End Session
                  </button>
                  <button
                    className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[blueviolet] text-white hover:bg-[blueviolet]/80 transition-colors"
                    onClick={() => {
                      toast.dismiss(t.id);
                      setSessionExtensionSeconds(prev => {
                        const next = prev + 30 * 60;
                        sessionStorage.setItem(`session_extension_${roomId}`, String(next));
                        return next;
                      });
                      socketService.emit('room:session:extended', { roomId });
                      toast.success('Session extended by 30 minutes! ⏰');
                    }}
                  >
                    Continue (+30 min)
                  </button>
                </div>
              </div>
            ),
            {
              duration: Infinity,
              id: 'session-end-prompt',
              style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
            }
          );
        } else {
          toast('⏰ Session time is up — waiting for host to decide…', {
            duration: 10000,
            style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRoom?.status, activeRoom?.updatedAt, sessionExtensionSeconds, isHost, dispatch, roomId, navigate]);

  // Sync session extension to all participants
  useEffect(() => {
    const handleSessionExtended = () => {
      if (!isHost) {
        setSessionExtensionSeconds(prev => {
          const next = prev + 30 * 60;
          sessionStorage.setItem(`session_extension_${roomId}`, String(next));
          return next;
        });
        toast.success('Host extended the session by 30 minutes! ⏰', {
          style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        });
      }
    };
    socketService.on('room:session:extended', handleSessionExtended);
    return () => socketService.off('room:session:extended', handleSessionExtended);
  }, [isHost, roomId]);

  // Persist session extension seconds to sessionStorage and handle cleanup on end
  useEffect(() => {
    if (roomId) {
      if (activeRoom?.status === 'ENDED') {
        sessionStorage.removeItem(`session_extension_${roomId}`);
      } else if (sessionExtensionSeconds > 0) {
        sessionStorage.setItem(`session_extension_${roomId}`, String(sessionExtensionSeconds));
      }
    }
  }, [sessionExtensionSeconds, roomId, activeRoom?.status]);

  // Keep track of current time to dynamically determine room expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showInviteModal) {
      const fetchBuddies = async () => {
        setIsLoadingBuddies(true);
        try {
          const data = await buddyService.getBuddyList();
          setBuddies(data || []);
        } catch (e: any) {
          toast.error('Failed to load buddies.');
        } finally {
          setIsLoadingBuddies(false);
        }
      };
      fetchBuddies();
    }
  }, [showInviteModal]);

  const handleInviteBuddy = async (userId: string) => {
    try {
      setInvitingIds(prev => [...prev, userId]);
      await dispatch(inviteToRoom({ roomId, userId })).unwrap();
      toast.success('Invitation sent successfully!');
    } catch (e: any) {
      toast.error(e || 'Failed to send invitation');
    } finally {
      setInvitingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !file) || isSending) return;
    
    dispatch(sendRoomMessage({ roomId, content: trimmed, file: file || undefined }));
    setContent('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleVideoCall = () => {
    if (isInGroupCall) {
      // Host is ending the call for everyone
      socketService.emit('room:video:end', { roomId });
      sessionStorage.removeItem(`in_group_call_${roomId}`);
      dispatch(endGroupCall());
    } else {
      // Host starting a new call
      sessionStorage.setItem(`in_group_call_${roomId}`, 'true');
      dispatch(startGroupCall(roomId));
      socketService.emit('room:video:start', { roomId });
    }
  };

  const handleJoinGroupCall = () => {
    if (activeCall) {
      toast.error("You cannot join a group video call while in a 1:1 call. Please end your 1:1 call first.");
      return;
    }
    dispatch(setIncomingGroupCall(null));
    sessionStorage.setItem(`in_group_call_${roomId}`, 'true');
    sessionStorage.removeItem(`declined_video_call_${roomId}`);
    dispatch(startGroupCall(roomId));
  };

  const handleEndRoom = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-zinc-100">Are you sure you want to end this room for everyone?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                sessionStorage.removeItem(`in_group_call_${roomId}`);
                sessionStorage.removeItem(`session_extension_${roomId}`);
                await dispatch(endRoom(roomId)).unwrap();
                navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
              } catch (e: any) {
                toast.error(e || 'Failed to end room');
              }
            }}
          >
            End Room
          </button>
        </div>
      </div>
    ), { duration: 6000, style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
  };

  const handleLeave = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-zinc-100">Are you sure you want to leave this study room?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                sessionStorage.removeItem(`in_group_call_${roomId}`);
                sessionStorage.removeItem(`session_extension_${roomId}`);
                await dispatch(leaveRoom(roomId)).unwrap();
                navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
              } catch (e: any) {
                toast.error(e || 'Failed to leave room');
              }
            }}
          >
            Leave
          </button>
        </div>
      </div>
    ), { duration: 6000, style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    await dispatch(respondToJoinRequest({ requestId, action }));
    toast.success(action === 'ACCEPTED' ? 'Request accepted!' : 'Request rejected');
  };

  const handleStartRoom = async () => {
    try {
      await dispatch(startRoom(roomId)).unwrap();
      toast.success('Session Started! Room is now active.');
    } catch (e: any) {
      toast.error(e || 'Failed to start session');
    }
  };

  // const handleStartFocusSession = () => {
  //   const groupStudyTask = {
  //     id: `study-room-${roomId}-${Date.now()}`,
  //     title: `Group Study: ${activeRoom?.name}`,
  //     description: 'Study room group session timer',
  //     status: 'IN_PROGRESS',
  //     priority: 'MEDIUM',
  //     estimatedPomodoros: 1,
  //     completedPomodoros: 0,
  //   } as any;
  //   dispatch(startPomodoro({ task: groupStudyTask, duration: 25 * 60, phase: 'FOCUS', isSmartBreaksEnabled: true }));
  //   socketService.emit('room:pomodoro:start', { roomId, task: groupStudyTask, duration: 25 * 60, phase: 'FOCUS', startedByName: user?.fullName || 'Host' });
  //   toast.success('Focus session started! Participants have been invited.');
  // };

  // const handleCopyTask = async (todo: TodoItem) => {
  //   try {
  //     await todoService.addTodo({
  //       title: todo.title,
  //       description: todo.description,
  //       priority: todo.priority,
  //       estimatedTime: todo.estimatedTime,
  //       pomodoroEnabled: todo.pomodoroEnabled,
  //     });
  //     toast.success('Task copied and added to your To-Do list! 🎯');
  //   } catch (e) {
  //     toast.error('Failed to copy task');
  //   }
  // };

  const handleAcceptSharedTask = (taskId: string, taskTitle: string) => {
    setAcceptedTaskIds(prev => prev.includes(taskId) ? prev : [...prev, taskId]);
    setIgnoredTaskIds(prev => prev.filter(id => id !== taskId));
    toast.success('Task accepted! Timer will auto-start when host begins. 🎯');
    // Broadcast acceptance to room chat
    const payload = JSON.stringify({ taskId, taskTitle, userName: user?.fullName || 'A participant' });
    dispatch(sendRoomMessage({ roomId, content: `[TASK_ACCEPTED]${payload}[/TASK_ACCEPTED]` }));
  };

  const handleIgnoreSharedTask = (taskId: string) => {
    setIgnoredTaskIds(prev => prev.includes(taskId) ? prev : [...prev, taskId]);
    setAcceptedTaskIds(prev => prev.filter(id => id !== taskId));
  };

  const handlePausePomodoro = () => {
    dispatch(pausePomodoro());
    socketService.emit('room:pomodoro:pause', { roomId });
  };

  const handleResumePomodoro = () => {
    dispatch(resumePomodoro());
    socketService.emit('room:pomodoro:resume', { roomId });
  };

  const handleStopPomodoro = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-zinc-100">Stop the Pomodoro timer for the entire room?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              dispatch(stopPomodoro());
              socketService.emit('room:pomodoro:stop', { roomId });
            }}
          >
            Stop Timer
          </button>
        </div>
      </div>
    ), { duration: 6000, style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
  };

  const handleShareTodos = (todos: TodoItem[]) => {
    const payload = JSON.stringify(todos);
    const messageContent = `[TODO_SHARE_DATA]${payload}[/TODO_SHARE_DATA]`;
    dispatch(sendRoomMessage({ roomId, content: messageContent }));
    setIsShareTodoOpen(false);
  };

  const handleStartRoomPomodoroForSharedTask = (todo: TodoItem) => {
    if (activeTask?.id && isRunning && activeTask.id !== todo.id) {
      toast.error(`A Pomodoro is already running for "${activeTask.title}". Stop it to start a new one.`);
      return;
    }
    dispatch(startPomodoro({
      task: todo,
      duration: (todo.estimatedTime || 25) * 60,
      phase: 'FOCUS',
      isSmartBreaksEnabled: true,
      conversationId: roomId,
      conversationType: 'ROOM',
      isRoomHost: true,
      completedInRoomName: activeRoom?.name || null
    }));
    socketService.emit('room:pomodoro:start', {
      roomId,
      task: todo,
      duration: (todo.estimatedTime || 25) * 60,
      phase: 'FOCUS',
      startedByName: user?.fullName || 'Host'
    });
    toast.success('Group Pomodoro started for shared task!');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleReportUser = (id: string) => {
    setReportingUserId(id);
    setShowReportList(false);
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => navigate(ROUTES.DASHBOARD_STUDY_ROOMS)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
            title="Back to Study Rooms"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Participant count clickable */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="relative p-1.5 rounded-xl hover:bg-white/5 transition-colors group"
            title="View participants"
          >
            <Users size={22} className="text-zinc-300 group-hover:text-white" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-[blueviolet] text-white text-[9px] font-bold rounded-full">
              {participantCount || 1}
            </span>
          </button>
          
          <span className="text-sm font-semibold text-zinc-200 truncate max-w-[120px]">{activeRoom?.name}</span>
          {sessionTimeRemaining !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold font-mono whitespace-nowrap animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Session: {formatTime(sessionTimeRemaining)}</span>
            </div>
          )}

          {/* Participants Overlay */}
          {showParticipants && (
            <div className="absolute left-4 top-14 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[30] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
              <div className="p-4 border-b border-white/5 bg-zinc-800/40 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <Users size={12} className="text-[blueviolet]" />
                  Participants
                </span>
                <button onClick={() => setShowParticipants(false)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-zinc-900/90">
                {isHost && (
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      setShowParticipants(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 mb-2 rounded-xl bg-[blueviolet]/10 hover:bg-[blueviolet]/20 border border-[blueviolet]/20 text-[blueviolet] hover:text-white text-xs font-semibold transition-all duration-200"
                  >
                    <Plus size={12} />
                    Invite Buddies
                  </button>
                )}
                {/* Host */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[blueviolet]/5 border border-[blueviolet]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center border border-white/10 overflow-hidden">
                      {activeRoom?.hostAvatar ? (
                        <img
                          src={activeRoom.hostAvatar}
                          alt="Host"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                        />
                      ) : null}
                      <User size={14} className={`text-zinc-500 ${activeRoom?.hostAvatar ? 'hidden' : ''}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-100">{activeRoom?.hostName}</p>
                      <span className="text-[9px] text-[blueviolet] font-bold uppercase">Host</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>

                {/* Other Participants */}
                {activeRoom?.participants?.filter(p => p.id !== activeRoom.hostId).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3" title={p.id === user?.id ? "You" : ""}>
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                          />
                        ) : null}
                        <User size={14} className={`text-zinc-500 ${p.avatar ? 'hidden' : ''}`} />
                      </div>
                      <p className={`text-xs font-medium ${p.id === user?.id ? 'text-[blueviolet]' : 'text-zinc-300'}`}>
                        {p.name} {p.id === user?.id && <span className="opacity-60">(You)</span>}
                      </p>
                    </div>
                    {isHost && p.id !== user?.id ? (
                      <button
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm font-semibold text-zinc-100">Are you sure you want to remove {p.name} from the room?</p>
                              <div className="flex justify-end gap-2 mt-1">
                                <button
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                                  onClick={() => toast.dismiss(t.id)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                  onClick={() => {
                                    dispatch(kickUser({ roomId, userId: p.id }));
                                    toast.dismiss(t.id);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ), { duration: 5000, style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Remove Member"
                      >
                        <UserMinus size={14} />
                      </button>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending requests badge for host */}
          {isHost && pendingRequests.length > 0 && (
            <button
              onClick={() => setShowRequestsPanel(!showRequestsPanel)}
              className="relative flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors"
            >
              <UserCheck size={12} />
              {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          {activeTask && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10">
              <span className="text-amber-400 font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
              {isHost && (
                <>
                  <button
                    onClick={() => isRunning ? handlePausePomodoro() : handleResumePomodoro()}
                    className={`p-1 rounded transition-colors ${
                      isRunning
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    title={isRunning ? 'Pause' : 'Resume'}
                  >
                    {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={handleStopPomodoro}
                    className="p-1.5 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                    title="Stop Timer"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* AI Button */}
          <button
            onClick={() => setIsAiMode(!isAiMode)}
            className={`p-2 rounded-xl transition-colors border ${
              isAiMode 
                ? 'bg-[blueviolet] text-white border-[blueviolet] shadow-lg shadow-[blueviolet]/20' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border-white/10'
            }`}
            title={isAiMode ? "Back to participants" : "Ask ProBuddy AI"}
          >
            <Bot size={16} />
          </button>

          {/* Share To-Do List (Host Only) */}
          {isHost && activeRoom?.status === 'LIVE' && (
            <button
              onClick={() => setIsShareTodoOpen(true)}
              className="p-2 rounded-xl border bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border-white/10 transition-colors"
              title="Share To-Do List"
            >
              <ListTodo size={16} />
            </button>
          )}

          {/* Video Call */}
          {isHost && (
            <button
              onClick={handleVideoCall}
              disabled={!!isRoomEnded || activeRoom?.status !== 'LIVE'}
              className={`p-2 rounded-xl transition-colors border ${
                isRoomEnded || activeRoom?.status !== 'LIVE'
                  ? 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500 border-white/5'
                  : isInGroupCall
                  ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border-white/10'
              }`}
              title={
                isRoomEnded
                  ? "Session ended"
                  : activeRoom?.status !== 'LIVE'
                  ? "Start session to use video call"
                  : "Video Call"
              }
            >
              <Video size={16} />
            </button>
          )}

          {/* Start Session Button (Host Only, when WAITING) */}
          {isHost && activeRoom?.status === 'WAITING' && !isExpired && (
            <button
              onClick={handleStartRoom}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[blueviolet] text-white text-sm font-bold hover:bg-[blueviolet]/80 transition-all shadow-lg shadow-[blueviolet]/20 border border-[blueviolet]/20 animate-pulse hover:animate-none"
            >
              <Users size={16} />
              Start Session
            </button>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => { setShowSettings(!showSettings); setShowReportList(false); }}
              className={`p-2 rounded-xl transition-colors border ${
                showSettings || showReportList
                  ? 'bg-[blueviolet] text-white border-[blueviolet]' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border-white/10'
              }`}
            >
              <Settings size={16} />
            </button>
            {(showSettings || showReportList) && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[40] animate-in fade-in slide-in-from-top-2 duration-200">
                {!showReportList ? (
                  <div className="divide-y divide-white/5">
                    <button
                      onClick={() => setShowReportList(true)}
                      className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <AlertTriangle size={16} className="text-zinc-500" />
                      Report User
                    </button>
                    <button
                      onClick={handleLeave}
                      className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <X size={16} className="text-zinc-500" />
                      Leave Room
                    </button>
                    {isHost && (
                      <button
                        onClick={handleEndRoom}
                        className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/5 transition-colors flex items-center gap-3"
                      >
                        <X size={16} />
                        End Room
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col max-h-72 overflow-hidden">
                    <div className="p-3 border-b border-white/5 flex items-center gap-2">
                       <button onClick={() => setShowReportList(false)} className="text-zinc-500 hover:text-white">
                         <ChevronLeft size={16} />
                       </button>
                       <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Report User</span>
                    </div>
                    <div className="overflow-y-auto p-1 custom-scrollbar">
                      {reportableParticipants.length === 0 ? (
                        <p className="p-4 text-center text-xs text-zinc-500">No participants to report</p>
                      ) : (
                        reportableParticipants.map(participant => (
                          <button
                            key={participant.id}
                            onClick={() => handleReportUser(participant.id)}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
                          >
                             <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                                {participant.avatar ? (
                                  <img
                                    src={participant.avatar}
                                    className="w-full h-full object-cover"
                                    alt={participant.name}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                                  />
                                ) : null}
                                <User size={14} className={`text-zinc-500 ${participant.avatar ? 'hidden' : ''}`} />
                             </div>
                             <span className="text-sm text-zinc-300 truncate">{participant.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Requests Panel */}
      {showRequestsPanel && isHost && pendingRequests.length > 0 && (
        <div className="px-4 py-3 border-b border-white/10 bg-amber-500/5 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-400">Join Requests</p>
            <button onClick={() => setShowRequestsPanel(false)} className="text-zinc-500 hover:text-zinc-300">
              <X size={12} />
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2">
                <span className="text-xs text-zinc-200">{req.userName || req.userId.slice(0, 8)}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                    className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
            <Users size={40} className="opacity-30" />
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg: RoomMessageDTO, idx) => {
          const isMe = msg.senderId === user?.id;

          if (msg.content && msg.content.startsWith('[TODO_SHARE_DATA]') && msg.content.endsWith('[/TODO_SHARE_DATA]')) {
            const jsonStr = msg.content.replace('[TODO_SHARE_DATA]', '').replace('[/TODO_SHARE_DATA]', '');
            try {
              const todos = JSON.parse(jsonStr) as TodoItem[];
              return (
                <div key={msg.id || idx} className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'} w-full`}>
                  {!isMe && (
                    <span className="text-[10px] text-zinc-500 mb-1 px-1">{msg.senderName || 'Unknown'}</span>
                  )}
                  <div className="flex flex-col w-full max-w-[85%] sm:max-w-[75%] gap-2 mt-1">
                    <div className={`text-xs text-zinc-400 mb-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {isMe ? 'You shared a To-Do list:' : `${msg.senderName || 'Unknown'} shared a To-Do list:`}
                    </div>
                    {todos.map(todo => (
                      <SharedTodoCard
                        key={todo.id}
                        todoId={todo.id}
                        initialTodo={todo}
                        type="room"
                        isMe={isMe}
                        isHost={isHost}
                        activeTask={activeTask}
                        isRunning={isRunning}
                        acceptedTaskIds={acceptedTaskIds}
                        ignoredTaskIds={ignoredTaskIds}
                        handleAcceptSharedTask={handleAcceptSharedTask}
                        handleIgnoreSharedTask={handleIgnoreSharedTask}
                        onStartTodoPomodoro={handleStartRoomPomodoroForSharedTask}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-600 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              );
            } catch (e) {
              console.error('Failed to parse shared todos', e);
            }
          }

          // Task Accepted notification
          if (msg.content && msg.content.startsWith('[TASK_ACCEPTED]') && msg.content.endsWith('[/TASK_ACCEPTED]')) {
            const jsonStr = msg.content.replace('[TASK_ACCEPTED]', '').replace('[/TASK_ACCEPTED]', '');
            try {
              const data = JSON.parse(jsonStr) as { taskId: string; taskTitle: string; userName: string };
              return (
                <div key={msg.id || idx} className="flex justify-center py-1">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium max-w-[90%]">
                    <Check size={11} className="flex-shrink-0" />
                    <span className="truncate">
                      <span className="font-semibold">{data.userName}</span>
                      {' '}accepted{' '}
                      <span className="font-semibold">&ldquo;{data.taskTitle}&rdquo;</span>
                    </span>
                  </div>
                </div>
              );
            } catch (e) {
              // ignore parse errors
            }
          }

          if (msg.content && (msg.content === '📹 Started a video call' || msg.content.includes('Declined the video call request'))) {
            if (msg.content.includes('Declined')) {
              return (
                <div key={msg.id || idx} className="flex justify-center py-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium max-w-[90%]">
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id || idx} className="flex justify-center py-2 w-full">
                <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-[blueviolet]/10 border border-[blueviolet]/20 text-center max-w-[85%] sm:max-w-[70%] shadow-lg shadow-[blueviolet]/5 animate-in fade-in duration-200">
                  <div className="w-10 h-10 rounded-full bg-[blueviolet]/25 border border-[blueviolet]/40 flex items-center justify-center text-[blueviolet] shadow-md shadow-[blueviolet]/10">
                    <Video size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {msg.senderName || 'The host'} started a video call
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Join to study and collaborate together.
                    </p>
                  </div>
                  {isHostCallActive ? (
                    !isInGroupCall ? (
                      <button
                        onClick={handleJoinGroupCall}
                        className="px-4 py-1.5 rounded-xl bg-[blueviolet] hover:bg-[blueviolet]/85 text-white text-xs font-bold transition-all shadow-md shadow-[blueviolet]/20 flex items-center gap-1.5"
                      >
                        <Video size={12} />
                        Join Call
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500 font-semibold italic bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5">
                        You are in this call
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-zinc-500 font-semibold italic bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5">
                      Call ended
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-[10px] text-zinc-500 mb-1 px-1">{msg.senderName || 'Unknown'}</span>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] ${
                  isMe
                    ? 'bg-zinc-800 text-zinc-200 rounded-br-none'
                    : 'bg-zinc-800/60 text-zinc-200 border border-white/5 rounded-bl-none'
                }`}
              >
                {msg.content && (
                  <div className="mb-1">{msg.content}</div>
                )}
                {msg.fileUrl && (
                  <div className="mt-2 group/file">
                    {msg.fileType?.startsWith('image/') ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50">
                        <img 
                          src={msg.fileUrl} 
                          alt="shared" 
                          className="max-w-full h-auto object-contain max-h-[300px] hover:scale-[1.02] transition-transform cursor-pointer"
                          onClick={() => window.open(msg.fileUrl, '_blank')}
                        />
                      </div>
                    ) : (
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-900 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-[blueviolet]/10 text-[blueviolet]">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200 truncate">
                            {msg.fileUrl.split('/').pop()}
                          </p>
                          <p className="text-[10px] text-zinc-500 uppercase">
                            {msg.fileType?.split('/')[1] || 'FILE'}
                          </p>
                        </div>
                        <Download size={16} className="text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-600 mt-1 px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area / Expiry notice */}
      {isRoomEnded ? (
        <div className="p-5 border-t border-white/10 bg-zinc-900/90 text-center flex flex-col items-center justify-center gap-2 flex-shrink-0">
          <AlertTriangle size={24} className="text-red-400 animate-bounce" />
          <div className="text-sm font-bold text-zinc-200">
            This study session has ended or expired.
          </div>
          <div className="text-xs text-zinc-500">
            You cannot send messages or start calls in an ended or expired room.
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/10 bg-zinc-900/80 flex-shrink-0">
          {file && (
            <div className="mb-3 flex items-center justify-between p-2.5 rounded-xl bg-[blueviolet]/5 border border-[blueviolet]/10 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[blueviolet]/10 text-[blueviolet]">
                  {file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={file ? "Add a caption..." : "Type any message and send..."}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-colors"
              />
              
              <div className="absolute right-12 top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-lg transition-colors ${
                    showEmojiPicker ? 'text-[blueviolet] bg-[blueviolet]/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                  title="Add Emoji"
                >
                  <Smile size={18} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-50 w-[320px] sm:w-[350px] max-w-[calc(100vw-32px)]">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.DARK}
                      lazyLoadEmojis={true}
                      width="100%"
                      height={350}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  file ? 'text-[blueviolet] bg-[blueviolet]/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
                title="Attach File"
              >
                <Paperclip size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !file) || isSending}
              className="p-3 rounded-xl bg-[blueviolet] text-white hover:bg-[blueviolet]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[blueviolet]/20"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Click outside settings & participants */}
      {(showSettings || showParticipants) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowSettings(false); setShowParticipants(false); }} />
      )}

      {reportingUserId && (
        <ReportModal
          reportedId={reportingUserId}
          initialContext={ReportContext.GROUP_ROOM}
          onClose={() => setReportingUserId(null)}
          onSuccess={async (blockUser?: boolean) => {
            toast.success('Report submitted successfully. Thank you for making the community safer.');
            if (blockUser && reportingUserId) {
              try {
                await buddyService.blockUser(reportingUserId);
                if (isHost) {
                  dispatch(kickUser({ roomId, userId: reportingUserId }));
                }
              } catch (e) {
                // silent
              }
            }
            setReportingUserId(null);
          }}
        />
      )}
      {/* Invite Buddies Modal */}
      {showInviteModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[blueviolet]/10 text-[blueviolet]">
                  <Users size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">Invite Buddies</h3>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-white/5">
              <input
                type="text"
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                placeholder="Search buddy by name..."
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-colors"
              />
            </div>

            {/* Buddy List */}
            <div className="flex-1 max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {isLoadingBuddies ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-[blueviolet] rounded-full animate-spin" />
                  <p className="text-[11px]">Loading buddies...</p>
                </div>
              ) : (() => {
                const currentParticipants = activeRoom?.participantIds || [];
                const hostId = activeRoom?.hostId || '';
                const filteredBuddies = buddies.filter(conn => {
                  const b = conn.buddy;
                  if (!b) return false;
                  if (currentParticipants.includes(b.userId) || b.userId === hostId) return false;
                  if (inviteSearch.trim()) {
                    return b.fullName.toLowerCase().includes(inviteSearch.toLowerCase()) || 
                           b.username.toLowerCase().includes(inviteSearch.toLowerCase());
                  }
                  return true;
                });

                if (filteredBuddies.length === 0) {
                  return (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      {inviteSearch.trim() ? 'No buddies match your search.' : 'No buddies available to invite.'}
                    </div>
                  );
                }

                return filteredBuddies.map(conn => {
                  const b = conn.buddy!;
                  const isInviting = invitingIds.includes(b.userId);
                  return (
                    <div key={b.userId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                          {b.profileImage || b.avatar ? (
                            <img
                              src={b.profileImage || b.avatar}
                              className="w-full h-full object-cover"
                              alt={b.fullName}
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                            />
                          ) : null}
                          <User size={14} className={`text-zinc-500 ${b.profileImage || b.avatar ? 'hidden' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{b.fullName}</p>
                          <p className="text-[10px] text-zinc-500 truncate">@{b.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInviteBuddy(b.userId)}
                        disabled={isInviting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[blueviolet] text-white hover:bg-[blueviolet]/80 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[blueviolet]/10 flex-shrink-0"
                      >
                        {isInviting ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={12} />
                            Invite
                          </>
                        )}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      <ShareTodoModal
        isOpen={isShareTodoOpen}
        onClose={() => setIsShareTodoOpen(false)}
        onShare={handleShareTodos}
      />

      {/* Focus Session Invitation Modal */}
      {pomodoroOffer && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleIgnoreFocusSession}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-[blueviolet]/10 text-[blueviolet] flex items-center justify-center mx-auto mb-4 border border-[blueviolet]/20 animate-bounce">
              <Timer size={32} />
            </div>
            
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Focus Session Invited!</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Host <span className="text-[blueviolet] font-bold">{pomodoroOffer.startedByName}</span> has started a 25-minute group study focus session for:
              <br />
              <strong className="text-zinc-200 mt-2 block bg-zinc-800/50 py-2 px-3 rounded-lg border border-white/5 font-semibold text-sm">
                {pomodoroOffer.task.title}
              </strong>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleIgnoreFocusSession}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Ignore
              </button>
              <button
                onClick={() => handleAcceptFocusSession(pomodoroOffer)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-semibold text-xs shadow-lg shadow-[blueviolet]/20 border border-[blueviolet]/20 transition-all"
              >
                Accept & Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late Join Invitation Modal */}
      {lateJoinOffer && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleSkipLateFocusSession}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Timer size={32} />
            </div>
            
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Focus Session in Progress!</h3>
            <p className="text-xs text-zinc-400 mb-6">
              A group focus session is currently active. You can join now with the remaining time:
              <br />
              <strong className="text-amber-400 mt-2 block bg-zinc-800/50 py-2 px-3 rounded-lg border border-white/5 font-mono font-bold text-lg">
                {formatTime(lateJoinOffer.timeRemaining)}
              </strong>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleSkipLateFocusSession}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => handleJoinLateFocusSession(lateJoinOffer)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 border border-amber-500/20 transition-all"
              >
                Join Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Session Statistics Summary Modal */}
      {statsSummary && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
          <div className="bg-zinc-900/95 border border-[blueviolet]/30 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setStatsSummary(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <UserCheck size={32} />
            </div>
            
            <h3 className="text-xl font-extrabold text-white mb-1">Focus Session Summary</h3>
            <p className="text-xs text-zinc-400 mb-6">Great job team! Here is what we accomplished:</p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-zinc-500 font-semibold mb-1">Joined</span>
                <span className="text-lg font-bold text-white">{statsSummary.participantsCount}</span>
              </div>
              <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-zinc-500 font-semibold mb-1">Completed</span>
                <span className="text-lg font-bold text-[blueviolet]">{statsSummary.tasksCompletedCount}</span>
              </div>
              <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-zinc-500 font-semibold mb-1">Pomodoros</span>
                <span className="text-lg font-bold text-amber-500">{statsSummary.pomodorosEarnedCount}</span>
              </div>
            </div>
            
            <button
              onClick={() => setStatsSummary(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-bold text-xs shadow-lg shadow-[blueviolet]/20 border border-[blueviolet]/20 transition-all"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Attend Video Call Ringing Overlay — shown to members as an incoming ringing modal */}
      {!isHost && (showRingingOverlay || (incomingGroupCall && incomingGroupCall.roomId === roomId)) && !isInGroupCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            {/* Pulsing Video Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[blueviolet] animate-ping opacity-25" />
              <div className="w-16 h-16 rounded-full bg-[blueviolet]/20 border border-[blueviolet]/30 flex items-center justify-center text-[blueviolet]">
                <Video size={32} className="animate-bounce" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">Incoming Group Video Call</h3>
            <p className="text-xs text-zinc-400 text-center mb-6">
              {activeRoom?.hostName || 'The host'} has started a group video call in this room.
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setShowRingingOverlay(false);
                  dispatch(setIncomingGroupCall(null));
                  sessionStorage.setItem(`declined_video_call_${roomId}`, 'true');
                  dispatch(sendRoomMessage({ roomId, content: '❌ Declined the video call request' }));
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/10 text-sm font-semibold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  setShowRingingOverlay(false);
                  dispatch(setIncomingGroupCall(null));
                  handleJoinGroupCall();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[blueviolet] text-white hover:bg-[blueviolet]/85 text-sm font-semibold transition-colors shadow-lg shadow-[blueviolet]/20"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
