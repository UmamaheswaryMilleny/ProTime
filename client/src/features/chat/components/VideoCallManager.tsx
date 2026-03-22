import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { setIncomingCall, setActiveCall } from '../store/chatSlice';
import { socketService } from '../../../shared/services/socketService';
import { Settings, Edit3, Clock, Flag, Mic, MicOff, Video as VideoIcon, VideoOff, ListTodo } from 'lucide-react';
import { SharedPomodoroPanel } from './SharedPomodoroPanel';

export const VideoCallOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const { incomingCall, activeCall, conversations } = useSelector((state: RootState) => state.chat);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [callStatus, setCallStatus] = useState<string>('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // New UI feature toggles
  const [callDuration, setCallDuration] = useState(0);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [notepadText, setNotepadText] = useState('');
  const [isTodoListOpen, setIsTodoListOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  const isCaller = activeCall?.isCaller || false;

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

  useEffect(() => {
    if (!activeCall) {
      cleanup();
      return;
    }

    const { conversationId, isCaller, offer } = activeCall;
    
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

        if (isCaller) {
          const offerParams = await pc.createOffer();
          await pc.setLocalDescription(offerParams);
          socketService.emit('webrtc:offer', { conversationId, offer: offerParams });
          setCallStatus(`Calling ${partnerName}...`);
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

  return (
    <div className="fixed inset-0 bg-black z-[100] p-4 sm:p-6 flex flex-col font-sans">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between w-full relative z-10 mb-4 px-2">
        <div className="flex items-center gap-4">
          {/* Timer pill */}
          <div className="flex items-center gap-2 bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
            <span>{callStatus ? callStatus : formatTime(callDuration)}</span>
            {!callStatus && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse ml-1" /> }
          </div>
          
          {/* Notepad Toggle */}
          <button 
            onClick={() => { setIsNotepadOpen(!isNotepadOpen); setIsTodoListOpen(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg ${isNotepadOpen ? 'bg-zinc-700 text-white' : 'bg-[#1c1c1e] text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Edit3 size={16} /> NotePad
          </button>
          
          {/* Settings Icon (Placeholder) */}
          <button className="text-[#7c3aed] hover:text-[#9353d3] p-2 transition-colors">
            <Settings size={28} />
          </button>
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

      {isTodoListOpen && (
        <div className="absolute top-24 left-10 w-80 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 p-4 z-20 flex flex-col h-96 animate-in slide-in-from-top-4 fade-in duration-200">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium flex items-center gap-2"><ListTodo size={18} className="text-[#7c3aed]" /> Tasks</h3>
            <button onClick={() => setIsTodoListOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-lg p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-sm gap-3">
             <ListTodo size={40} className="text-zinc-700" />
             <p className="font-medium text-center px-4">Todo list integration coming soon. Work with your team on tasks here!</p>
          </div>
        </div>
      )}

      {/* Shared Pomodoro Panel */}
      <SharedPomodoroPanel 
        conversationId={activeCall.conversationId} 
        isOpen={isPomodoroOpen} 
        onClose={() => setIsPomodoroOpen(false)} 
      />

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

          {/* Pomodoro */}
          <button 
            onClick={() => { setIsPomodoroOpen(true); setIsTodoListOpen(false); setIsNotepadOpen(false); }}
            title="Pomodoro Timer"
            className="p-3.5 rounded-full transition-colors flex items-center justify-center bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20 ml-2"
          >
            <Clock size={22} />
          </button>

           {/* TodoList */}
           <button 
            onClick={() => { setIsTodoListOpen(!isTodoListOpen); setIsNotepadOpen(false); }}
            title="Todo List"
            className={`p-3.5 rounded-full transition-colors flex items-center justify-center ${isTodoListOpen ? 'bg-zinc-700 text-white' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <ListTodo size={22} />
          </button>

          {/* Report User */}
          <button 
            onClick={() => alert('Report user functionality triggered')}
            title="Report User"
            className="p-3.5 rounded-full transition-colors flex items-center justify-center bg-transparent text-zinc-500 hover:text-red-400 hover:bg-zinc-800 ml-2"
          >
            <Flag size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
