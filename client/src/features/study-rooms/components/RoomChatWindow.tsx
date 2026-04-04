import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile, Send, Share2, Users, Settings, Video, Timer, Bot, UserCheck, X, Check, ChevronLeft, User, AlertTriangle, Paperclip, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { sendRoomMessage, fetchPendingRequests, respondToJoinRequest, startGroupCall, endRoom, leaveRoom, startRoom } from '../store/studyRoomSlice';
import { pausePomodoro, resumePomodoro } from '../../todo/store/pomodoroSlice';
import { ReportModal } from '../../chat/components/ReportModal';
import type { RoomMessageDTO } from '../api/studyRoomApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

interface RoomChatWindowProps {
  roomId: string;
  isAiMode: boolean;
  setIsAiMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoomChatWindow: React.FC<RoomChatWindowProps> = ({ roomId, isAiMode, setIsAiMode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRoom, messages, isSending, pendingRequests, isInGroupCall } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);
  const { activeTask, isRunning, timeRemaining } = useAppSelector(s => s.pomodoro);


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

  const isHost = activeRoom?.hostId === user?.id;
  const participantCount = activeRoom ? activeRoom.participantIds.length : 0;
  const reportableParticipants = activeRoom?.participants?.filter(p => p.id !== user?.id) || [];

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
    dispatch(startGroupCall(roomId));
  };

  const handleEndRoom = async () => {
    if (!window.confirm('Are you sure you want to end this room for everyone?')) return;
    await dispatch(endRoom(roomId));
    navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
  };

  const handleLeave = async () => {
    await dispatch(leaveRoom(roomId));
    navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    await dispatch(respondToJoinRequest({ requestId, action }));
    toast.success(action === 'ACCEPTED' ? 'Request accepted!' : 'Request rejected');
  };

  const handleStartRoom = async () => {
    try {
      await dispatch(startRoom(roomId)).unwrap();
      toast.success('Session started! Everyone has been notified.');
    } catch (e: any) {
      toast.error(e || 'Failed to start session');
    }
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
                {/* Host */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[blueviolet]/5 border border-[blueviolet]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center border border-white/10 overflow-hidden">
                      {activeRoom?.hostAvatar ? (
                        <img
                          src={activeRoom.hostAvatar}
                          alt="Host"
                          className="w-full h-full object-cover"
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
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                          />
                        ) : null}
                        <User size={14} className={`text-zinc-500 ${p.avatar ? 'hidden' : ''}`} />
                      </div>
                      <p className={`text-xs font-medium ${p.id === user?.id ? 'text-[blueviolet]' : 'text-zinc-300'}`}>
                        {p.name} {p.id === user?.id && <span className="opacity-60">(You)</span>}
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
              <button
                onClick={() => isRunning ? dispatch(pausePomodoro()) : dispatch(resumePomodoro())}
                className="p-1 rounded bg-[blueviolet]/20 text-[blueviolet] hover:bg-[blueviolet]/30 transition-colors"
              >
                <Timer size={14} />
              </button>
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

          {/* Video Call */}
          <button
            onClick={handleVideoCall}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
              isInGroupCall
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-zinc-800 text-zinc-300 hover:text-white border-white/10 hover:bg-zinc-700'
            }`}
          >
            <Video size={14} />
            <span>Video Call</span>
          </button>

          {/* Start Session Button (Host Only, when WAITING) */}
          {isHost && activeRoom?.status === 'WAITING' && (
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

      {/* Input Area */}
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
          <button
            type="button"
            className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-white/10"
          >
            <Share2 size={16} />
          </button>
        </form>
      </div>

      {/* Click outside settings & participants */}
      {(showSettings || showParticipants) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowSettings(false); setShowParticipants(false); }} />
      )}

      {/* Report Modal */}
      {reportingUserId && (
        <ReportModal
          reportedId={reportingUserId}
          onClose={() => setReportingUserId(null)}
          onSuccess={() => {
            toast.success('Report submitted successfully. Thank you for making the community safer.');
            setReportingUserId(null);
          }}
        />
      )}
    </div>
  );
};
