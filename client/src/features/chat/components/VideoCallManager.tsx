import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { setIncomingCall, setActiveCall } from '../store/chatSlice';
import { socketService } from '../../../shared/services/socketService';
import { Settings, Flag, Mic, MicOff, Video as VideoIcon, VideoOff, ListTodo, Calendar, PhoneOff, MoreVertical, Loader } from 'lucide-react';
import { ReportModal } from './ReportModal';
import { ScheduleRecurringSessionModal } from './ScheduleRecurringSessionModal';
import toast from 'react-hot-toast';
import { useTodo } from '../../todo/hooks/useTodo';
import { usePomodoro } from '../../todo/hooks/usePomodoro';
import { PomodoroMinimized } from '../../todo/components/PomodoroMinimized';
import { PomodoroModal } from '../../todo/components/PomodoroModal';

export const VideoCallOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const { incomingCall, activeCall, conversations } = useSelector((state: RootState) => state.chat);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id ?? '');
  const currentUserFullName = useSelector((state: RootState) => state.auth.user?.fullName ?? 'Someone');

  const { todos, isLoading: isTodosLoading, deleteTodo } = useTodo();
  const {
    activeTask,
    timeRemainingFormatted,
    isRunning: isTodoRunning,
    initialTime,
    timeRemaining,
    resume,
    pause,
    reset,
    stop,
    start,
    phase,
    skipBreak,
    isSmartBreaksEnabled,
    totalPausedSeconds
  } = usePomodoro();

  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

  // Local wrapper functions to handle Pomodoro actions in the video call context
  const handleStartTodoPomodoro = (taskId: string) => {
    const task = todos.find(t => t.id === taskId);
    if (!task) return;
    if (task.pomodoroEnabled && task.estimatedTime) {
      start(task, task.estimatedTime * 60, activeCall?.conversationId);
      setIsPomodoroModalOpen(true);
    }
  };
  const resumeTodoTimer = (conversationId?: string) => resume(conversationId);
  const pauseTodoTimer = (conversationId?: string) => pause(conversationId);
  const resetTodoTimer = () => reset();
  const handleStopTodoPomodoro = () => {
    stop(activeCall?.conversationId);
    setIsPomodoroModalOpen(false);
  };

  const {
    buddyActiveTask,
    buddyTimeRemaining,
    buddyIsRunning,
    buddyConversationId
  } = useSelector((state: RootState) => state.pomodoro);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [callStatus, setCallStatus] = useState<string>('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // New UI feature toggles
  const [callDuration, setCallDuration] = useState(0);
  // const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  // const [notepadText, setNotepadText] = useState('');
  const [isTodoListOpen, setIsTodoListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [ringTimeout, setRingTimeout] = useState(60);

  const isCaller = activeCall?.isCaller || false;

  // Auto-renegotiate if we receive an offer while already in a call (e.g. peer refreshed)
  useEffect(() => {
    if (activeCall && incomingCall && incomingCall.conversationId === activeCall.conversationId) {
      const renegotiate = async () => {
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketService.emit('webrtc:answer', { conversationId: activeCall.conversationId, answer });
          }
          dispatch(setIncomingCall(null)); // clear the incoming call trigger
        } catch (error) {
          console.error("Renegotiation failed:", error);
        }
      };
      renegotiate();
    }
  }, [activeCall, incomingCall, dispatch]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    // No setState here — cleanup is called from effects; setState must stay in handlers
  };

  const handleEndCall = () => {
    if (activeCall) {
      if (isCaller && callStatus.startsWith('Calling')) {
        socketService.emit('webrtc:missed-call', { 
          conversationId: activeCall.conversationId, 
          callerName: currentUserFullName
        });
      }
      socketService.emit('webrtc:call-ended', { conversationId: activeCall.conversationId });
    }
    setCallStatus(''); // safe here — called from event handlers, not effect body
    setCallDuration(0); // reset duration
    dispatch(setActiveCall(null));
    cleanup();
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeCall && !callStatus) {
      // Connected and active
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall, callStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Ring timeout (60 seconds)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeCall && isCaller && callStatus.startsWith('Calling')) {
      if (ringTimeout <= 0) {
        handleEndCall();
        toast.error('No answer. Call ended.');
        return;
      }
      interval = setInterval(() => {
        setRingTimeout(prev => prev - 1);
      }, 1000);
    } else if (!callStatus.startsWith('Calling')) {
      setRingTimeout(60);
    }
    return () => clearInterval(interval);
  }, [activeCall, isCaller, callStatus, ringTimeout, currentUserFullName]);

  // Disconnect on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If we are just ringing someone, cancel the ring.
      // But if we are in an ACTIVE call, do NOT end the call! Let the peer wait for our reconnect.
      if (!activeCall && incomingCall) {
        socketService.emit('webrtc:call-ended', { conversationId: incomingCall.conversationId });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeCall, incomingCall]);

  // WebRTC Setup
  useEffect(() => {
    if (!activeCall) {
      cleanup();
      return;
    }

    const { conversationId, isCaller, offer, isReconnecting } = activeCall;
    
    // Finds partner name
    const conv = conversations.find(c => c.id === conversationId);
    const partnerName = conv?.otherUser?.fullName || 'Buddy';

    const initCall = async () => {
      try {
        setCallStatus(isCaller ? `Starting call with ${partnerName}...` : 'Connecting...');

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socketService.emit('webrtc:ice-candidate', { conversationId, candidate: e.candidate });
          }
        };

        pc.ontrack = (e) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        if (isCaller || isReconnecting) {
          const offerParams = await pc.createOffer();
          await pc.setLocalDescription(offerParams);
          socketService.emit('webrtc:offer', { 
            conversationId, 
            offer: offerParams, 
            callerName: currentUserFullName 
          });
          if (isReconnecting) {
             dispatch(setActiveCall({ ...activeCall, isReconnecting: false }));
          } else {
            setCallStatus(`Calling ${partnerName}...`);
          }
        } else if (offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketService.emit('webrtc:answer', { conversationId, answer });
          setCallStatus(''); // Connected
        }
      } catch (err) {
        console.error('Failed to init WebRTC:', err);
        setCallStatus('');
        handleEndCall();
      }
    };

    initCall();

    const handleAnswer = async (data: { conversationId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.conversationId === conversationId && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallStatus('');
      }
    };

    const handleIceCandidate = async (data: { conversationId: string; candidate: RTCIceCandidateInit }) => {
      if (data.conversationId === conversationId && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    socketService.on('webrtc:answer', handleAnswer);
    socketService.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socketService.off('webrtc:answer', handleAnswer);
      socketService.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [activeCall, conversations]);



  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  const handleAcceptIncoming = () => {
    if (incomingCall) {
      dispatch(setActiveCall({ 
        conversationId: incomingCall.conversationId, 
        isCaller: false, 
        offer: incomingCall.offer 
      }));
      dispatch(setIncomingCall(null));
    }
  };

  const handleDeclineIncoming = () => {
    if (incomingCall) {
      socketService.emit('webrtc:call-ended', { conversationId: incomingCall.conversationId });
      dispatch(setIncomingCall(null));
    }
  };

  if (incomingCall && !activeCall) {
    // Lookup partner name for proper display
    const conv = conversations.find(c => c.id === incomingCall.conversationId);
    const callerName = conv?.otherUser?.fullName || incomingCall.callerName || 'Buddy';

    return (
      <div className="fixed top-8 right-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl z-50 animate-bounce flex flex-col items-center border border-indigo-100 dark:border-indigo-900/50">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-2xl mb-4">
          {callerName.charAt(0).toUpperCase()}
        </div>
        <h4 className="text-gray-900 dark:text-white font-semibold text-lg">{callerName}</h4>
        <p className="text-gray-500 mb-6 font-medium tracking-wide">is calling you...</p>
        <div className="flex space-x-4">
          <button onClick={handleDeclineIncoming} className="px-6 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl font-bold transition">Decline</button>
          <button onClick={handleAcceptIncoming} className="px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold transition shadow-lg shadow-green-500/30">Accept</button>
        </div>
      </div>
    );
  }

  if (!activeCall) return null;

  // Get the other user's name for display in the active call header
  const activeConv = conversations.find(c => c.id === activeCall.conversationId);
  const partnerName = activeConv?.otherUser?.fullName || 'Buddy';
  const otherUserId = activeConv?.otherUser?.userId ?? '';

  return (
    <div className="fixed inset-0 bg-black z-[100] p-4 sm:p-6 flex flex-col font-sans">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between w-full relative z-10 mb-4 px-2">
        <div className="flex items-center gap-4">
          {/* Timer pill */}
          <div className="flex items-center gap-2 bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
             <span>{callStatus ? (callStatus.startsWith('Calling') ? `${callStatus} (${ringTimeout}s)` : callStatus) : formatTime(callDuration)}</span>
            {!callStatus && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse ml-1" /> }
          </div>

          {/* Pomodoro Timer integration */}
          {(buddyActiveTask && buddyConversationId === activeCall.conversationId) ? (
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
              onStart={() => resumeTodoTimer(activeCall.conversationId)}
              onPause={() => pauseTodoTimer(activeCall.conversationId)}
              onStop={handleStopTodoPomodoro}
              onMaximize={() => setIsPomodoroModalOpen(true)}
            />
          ) : null}
          
          {/* Notepad Toggle — COMMENTED OUT */}
          {/*
          <button 
            onClick={() => { setIsNotepadOpen(!isNotepadOpen); setIsTodoListOpen(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg ${isNotepadOpen ? 'bg-zinc-700 text-white' : 'bg-[#1c1c1e] text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Edit3 size={16} /> NotePad
          </button>
          */}

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`text-[#7c3aed] hover:text-[#9353d3] p-2 transition-colors rounded-lg ${isSettingsOpen ? 'bg-zinc-800' : ''}`}
              title="Settings"
            >
              <Settings size={28} />
            </button>

            {isSettingsOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-zinc-800 border border-white/5 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsScheduleModalOpen(true);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors gap-3"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Session</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleEndCall();
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors gap-3"
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
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors gap-3 font-medium"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report User</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* End Call Button */}
        <button 
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-red-600/30 tracking-wide"
        >
          End Call
        </button>
      </div>

      {/* ── Video Container ────────────────────────────────────── */}
      <div className="flex-1 relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Remote Name over video */}
        <div className="absolute top-6 left-6 bg-zinc-900/80 backdrop-blur text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg border border-white/5 z-10 tracking-wide">
          {partnerName}
        </div>

        {/* Local PIP Video */}
        <div className="absolute right-6 bottom-6 w-36 h-48 sm:w-56 sm:h-72 bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 z-10 transition-all duration-300 hover:scale-[1.02]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCamOff ? 'hidden' : ''} ${isCaller ? 'scale-x-[-1]' : ''}`}
          />
          {isCamOff && (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900">
              <VideoOff size={40} />
            </div>
          )}
          
          {/* "You" badge */}
          <div className="absolute bottom-3 right-3 bg-zinc-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/10">
            You
          </div>
        </div>
      </div>

      {/* ── Overlay Panels (Notepad, Todo) ─────────────────────── */}

      {/* Notepad Panel — COMMENTED OUT */}
      {/*
      {isNotepadOpen && (
        <div className="absolute top-24 left-10 w-80 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 p-4 z-20 flex flex-col h-96 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium flex items-center gap-2"><Edit3 size={18} className="text-[#7c3aed]" /> My Notepad</h3>
            <button onClick={() => setIsNotepadOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-lg p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <textarea 
            className="flex-1 bg-zinc-800/50 text-white rounded-xl p-4 outline-none border border-zinc-700/50 focus:border-[#7c3aed]/50 resize-none text-sm placeholder:text-zinc-500 font-medium leading-relaxed"
            placeholder="Jot down notes during the call..."
            value={notepadText}
            onChange={(e) => setNotepadText(e.target.value)}
          />
        </div>
      )}
      */}

      {isTodoListOpen && (
        <div className="absolute top-24 left-10 w-96 bg-zinc-900 rounded-3xl shadow-2xl border border-white/10 p-0 z-20 flex flex-col max-h-[80vh] h-[550px] animate-in slide-in-from-top-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><ListTodo size={20} className="text-[#8A2BE2]" /> Tasks</h2>
            <button onClick={() => setIsTodoListOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[200px] custom-scrollbar">
            {isTodosLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin text-[#8A2BE2]" size={32} />
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center text-zinc-400 py-10">
                <p>No tasks found.</p>
                <p className="text-sm mt-2 opacity-70">Tasks created in your dashboard will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => {
                  const priorityColor = todo.priority === 'HIGH' ? 'text-red-500 bg-red-500/10 border-red-500/20' : todo.priority === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-green-500 bg-green-500/10 border-green-500/20';
                  return (
                    <div key={todo.id} className="bg-zinc-800/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 shadow-lg hover:bg-zinc-800 transition-colors w-full text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${todo.status === 'COMPLETED' ? 'text-zinc-500 line-through' : 'text-white'}`}>{todo.title}</h4>
                          {todo.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{todo.description}</p>}
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap ${priorityColor}`}>{todo.priority}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium pt-1">
                        <span>{todo.estimatedTime} Min</span>
                        <span>{todo.pomodoroEnabled ? 'Pomodoro' : 'Standard'}</span>
                        <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                            {todo.priority === 'HIGH' ? '5XP' : todo.priority === 'MEDIUM' ? '3XP' : '2XP'}
                        </span>
                      </div>

                      {todo.pomodoroEnabled && todo.status !== 'COMPLETED' && (
                        <div className="border-t border-white/5 pt-3 flex justify-end">
                          <button 
                            onClick={() => {
                              if (activeTask && activeTask.id !== todo.id) {
                                toast.error('A Pomodoro timer is already running for another task.');
                                return;
                              }
                              if (activeTask?.id === todo.id) return; // Prevent double trigger
                              handleStartTodoPomodoro(todo.id);
                            }} 
                            className={`${
                              activeTask?.id === todo.id
                                ? (isTodoRunning 
                                    ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20' 
                                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20')
                                : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-[#7c3aed]/20'
                            } text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg`}
                          >
                            {activeTask?.id === todo.id 
                              ? (isTodoRunning ? 'Started' : 'Paused') 
                              : 'Start Timer'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Bottom Controls & Time ────────────────────────────── */}
      <div className="relative w-full h-20 mt-4 flex items-center justify-between px-2">
        {/* Call Time (bottom left overlayish) */}
        <div className="text-amber-500 font-bold text-lg font-mono tracking-wider ml-4 drop-shadow-md">
          {formatTime(callDuration)}
        </div>

        {/* Central Floating Dock */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1c1c1e] px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-800/80">
          
          {/* Mic */}
          <button 
            onClick={toggleMic}
            title={isMicMuted ? 'Unmute' : 'Mute'}
            className={`p-3.5 rounded-full transition-all flex items-center justify-center ${isMicMuted ? 'bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700' : 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20 scale-105'}`}
          >
            {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Camera */}
          <button 
            onClick={toggleCam}
            title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
            className={`p-3.5 rounded-full transition-all flex items-center justify-center ${isCamOff ? 'bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700' : 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20 scale-105'}`}
          >
            {isCamOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
          </button>


           {/* TodoList */}
           <button 
            onClick={() => { setIsTodoListOpen(!isTodoListOpen); }}
            title="Todo List"
            className={`p-3.5 rounded-full transition-colors flex items-center justify-center ${isTodoListOpen ? 'bg-zinc-700 text-white' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <ListTodo size={22} />
          </button>

        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      {isReportModalOpen && otherUserId && (
        <ReportModal
          reportedId={otherUserId}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => {
            toast.success('Report submitted. Our team will review it.');
            setIsReportModalOpen(false);
          }}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleRecurringSessionModal
          conversationId={activeCall.conversationId}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      <PomodoroModal
        isOpen={isPomodoroModalOpen}
        task={activeTask}
        timeRemainingFormatted={timeRemainingFormatted}
        isRunning={isTodoRunning}
        onStart={() => resumeTodoTimer(activeCall.conversationId)}
        onPause={() => pauseTodoTimer(activeCall.conversationId)}
        onReset={resetTodoTimer}
        onMinimize={() => setIsPomodoroModalOpen(false)}
        onClose={handleStopTodoPomodoro}
        progressPercentage={initialTime > 0 ? (timeRemaining / initialTime) * 100 : 100}
        phase={phase}
        onSkipBreak={skipBreak}
        isSmartBreaksEnabled={isSmartBreaksEnabled}
        totalPausedSeconds={totalPausedSeconds}
      />
    </div>
  );
};
