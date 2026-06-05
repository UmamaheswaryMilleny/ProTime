import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { endGroupCall } from '../store/studyRoomSlice';
import { socketService } from '../../../shared/services/socketService';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Settings, Timer } from 'lucide-react';
import { pausePomodoro, resumePomodoro } from '../../todo/store/pomodoroSlice';

interface PeerState {
  userId: string;
  userName: string;
  stream: MediaStream | null;
  isVideoOn: boolean;
  isAudioOn: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const GroupVideoCall: React.FC = () => {
  const dispatch = useAppDispatch();
  const { groupCallRoomId, activeRoom } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);
  const { activeTask, isRunning, timeRemaining } = useAppSelector(s => s.pomodoro);

  const isHost = activeRoom?.hostId === user?.id;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerState>>(new Map());
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // peerConnections: userId -> RTCPeerConnection
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Track pending ICE candidates before remote description is set
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const getParticipantName = useCallback((id: string): string => {
    if (!activeRoom) return id.slice(0, 6);
    if (id === activeRoom.hostId) return activeRoom.hostName || 'Host';
    const p = activeRoom.participants?.find(part => part.id === id);
    return p ? p.name : id.slice(0, 6);
  }, [activeRoom]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Create a peer connection for a given remote userId ──────────────────────
  const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
    // Close any existing connection first
    const existing = peerConnections.current.get(remoteUserId);
    if (existing) {
      existing.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketService.emit('room:webrtc:ice-candidate', {
          targetUserId: remoteUserId,
          roomId: groupCallRoomId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    // Remote stream
    pc.ontrack = (e) => {
      const stream = e.streams[0];
      setPeers(prev => {
        const next = new Map(prev);
        const existing = next.get(remoteUserId);
        next.set(remoteUserId, {
          userId: remoteUserId,
          userName: getParticipantName(remoteUserId),
          stream,
          isVideoOn: existing?.isVideoOn ?? true,
          isAudioOn: existing?.isAudioOn ?? true,
        });
        return next;
      });
    };

    // Connection state logging
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${remoteUserId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    peerConnections.current.set(remoteUserId, pc);
    return pc;
  }, [groupCallRoomId, getParticipantName]);

  // ── Flush any pending ICE candidates ───────────────────────────────────────
  const flushPendingCandidates = useCallback(async (remoteUserId: string) => {
    const candidates = pendingCandidates.current.get(remoteUserId) || [];
    const pc = peerConnections.current.get(remoteUserId);
    if (!pc) return;
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Failed to add buffered ICE candidate', err);
      }
    }
    pendingCandidates.current.delete(remoteUserId);
  }, []);

  // ── Initialize local media ──────────────────────────────────────────────────
  useEffect(() => {
    if (!groupCallRoomId) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setLocalStream(audioOnly);
          localStreamRef.current = audioOnly;
          setIsVideoOn(false);
        } catch (err2) {
          console.error('[GroupVideo] No media available', err2);
        }
      }
    };

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, [groupCallRoomId]);

  // ── Join the call once local media is ready ─────────────────────────────────
  useEffect(() => {
    if (!groupCallRoomId || !localStream) return;

    // Tell the server we're joining — it will respond with existing participants
    socketService.emit('room:webrtc:join', { roomId: groupCallRoomId });

    return () => {
      socketService.emit('room:webrtc:leave', { roomId: groupCallRoomId });
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
      setPeers(new Map());
    };
  }, [groupCallRoomId, localStream]);

  // ── Socket signaling handlers ───────────────────────────────────────────────
  useEffect(() => {
    if (!groupCallRoomId || !localStream) return;

    // Server sends us the list of users already in the call
    const handleExistingParticipants = async (data: { roomId: string; participants: string[] }) => {
      if (data.roomId !== groupCallRoomId) return;
      console.log('[WebRTC] Existing participants:', data.participants);

      for (const remoteUserId of data.participants) {
        if (remoteUserId === user?.id) continue;

        // We are the NEW joiner, so we initiate the offer
        const pc = createPeerConnection(remoteUserId);

        // Ensure the peer entry exists in state (even before stream arrives)
        setPeers(prev => {
          const next = new Map(prev);
          if (!next.has(remoteUserId)) {
            next.set(remoteUserId, {
              userId: remoteUserId,
              userName: getParticipantName(remoteUserId),
              stream: null,
              isVideoOn: true,
              isAudioOn: true,
            });
          }
          return next;
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.emit('room:webrtc:offer', {
          targetUserId: remoteUserId,
          roomId: groupCallRoomId,
          offer,
        });
      }
    };

    // A new user joined AFTER us — they will send us an offer
    const handleUserJoined = (data: { roomId: string; userId: string }) => {
      if (data.roomId !== groupCallRoomId) return;
      if (data.userId === user?.id) return;
      console.log('[WebRTC] New user joined, waiting for their offer:', data.userId);

      // Pre-create the peer state so the tile shows up
      setPeers(prev => {
        const next = new Map(prev);
        if (!next.has(data.userId)) {
          next.set(data.userId, {
            userId: data.userId,
            userName: getParticipantName(data.userId),
            stream: null,
            isVideoOn: true,
            isAudioOn: true,
          });
        }
        return next;
      });
    };

    // Received an offer from an existing participant (they initiated to us)
    const handleOffer = async (data: { senderId: string; roomId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.roomId !== groupCallRoomId) return;
      console.log('[WebRTC] Received offer from:', data.senderId);

      const pc = createPeerConnection(data.senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      await flushPendingCandidates(data.senderId);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.emit('room:webrtc:answer', {
        targetUserId: data.senderId,
        roomId: groupCallRoomId,
        answer,
      });

      setPeers(prev => {
        const next = new Map(prev);
        if (!next.has(data.senderId)) {
          next.set(data.senderId, {
            userId: data.senderId,
            userName: getParticipantName(data.senderId),
            stream: null,
            isVideoOn: true,
            isAudioOn: true,
          });
        }
        return next;
      });
    };

    // Received answer to our offer
    const handleAnswer = async (data: { senderId: string; roomId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.roomId !== groupCallRoomId) return;
      const pc = peerConnections.current.get(data.senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        await flushPendingCandidates(data.senderId);
      }
    };

    // ICE candidate from a peer
    const handleIceCandidate = async (data: { senderId: string; roomId: string; candidate: RTCIceCandidateInit }) => {
      if (data.roomId !== groupCallRoomId) return;
      const pc = peerConnections.current.get(data.senderId);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.warn('[WebRTC] addIceCandidate error:', err);
        }
      } else {
        // Buffer until remote description is set
        const buf = pendingCandidates.current.get(data.senderId) || [];
        buf.push(data.candidate);
        pendingCandidates.current.set(data.senderId, buf);
      }
    };

    // A user left the call
    const handleUserLeft = (data: { userId: string; roomId: string }) => {
      if (data.roomId !== groupCallRoomId) return;
      const pc = peerConnections.current.get(data.userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(data.userId);
      }
      pendingCandidates.current.delete(data.userId);
      setPeers(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };

    // Host ended the entire call
    const handleVideoCallEnded = (data: { roomId: string }) => {
      if (data.roomId !== groupCallRoomId) return;
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setPeers(new Map());
      dispatch(endGroupCall());
    };

    // Camera/mic toggle from peers
    const handleCameraToggle = (data: { userId: string; isVideoOn: boolean }) => {
      setPeers(prev => {
        const next = new Map(prev);
        const peer = next.get(data.userId);
        if (peer) next.set(data.userId, { ...peer, isVideoOn: data.isVideoOn });
        return next;
      });
    };

    const handleMicToggle = (data: { userId: string; isAudioOn: boolean }) => {
      setPeers(prev => {
        const next = new Map(prev);
        const peer = next.get(data.userId);
        if (peer) next.set(data.userId, { ...peer, isAudioOn: data.isAudioOn });
        return next;
      });
    };

    socketService.on('room:webrtc:existing-participants', handleExistingParticipants);
    socketService.on('room:webrtc:user-joined', handleUserJoined);
    socketService.on('room:webrtc:offer', handleOffer);
    socketService.on('room:webrtc:answer', handleAnswer);
    socketService.on('room:webrtc:ice-candidate', handleIceCandidate);
    socketService.on('room:webrtc:user-left', handleUserLeft);
    socketService.on('room:video:ended', handleVideoCallEnded);
    socketService.on('room:webrtc:camera-toggle', handleCameraToggle);
    socketService.on('room:webrtc:mic-toggle', handleMicToggle);

    return () => {
      socketService.off('room:webrtc:existing-participants', handleExistingParticipants);
      socketService.off('room:webrtc:user-joined', handleUserJoined);
      socketService.off('room:webrtc:offer', handleOffer);
      socketService.off('room:webrtc:answer', handleAnswer);
      socketService.off('room:webrtc:ice-candidate', handleIceCandidate);
      socketService.off('room:webrtc:user-left', handleUserLeft);
      socketService.off('room:video:ended', handleVideoCallEnded);
      socketService.off('room:webrtc:camera-toggle', handleCameraToggle);
      socketService.off('room:webrtc:mic-toggle', handleMicToggle);
    };
  }, [groupCallRoomId, localStream, user?.id, dispatch, createPeerConnection, flushPendingCandidates, getParticipantName]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const toggleAudio = () => {
    if (localStream) {
      const newState = !isAudioOn;
      localStream.getAudioTracks().forEach(t => { t.enabled = newState; });
      setIsAudioOn(newState);
      socketService.emit('room:webrtc:mic-toggle', { roomId: groupCallRoomId, isAudioOn: newState });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const newState = !isVideoOn;
      localStream.getVideoTracks().forEach(t => { t.enabled = newState; });
      setIsVideoOn(newState);
      socketService.emit('room:webrtc:camera-toggle', { roomId: groupCallRoomId, isVideoOn: newState });
    }
  };

  const handleEndCall = () => {
    if (isHost) {
      // Host ending the call broadcasts to ALL members so everyone's overlay closes
      socketService.emit('room:video:end', { roomId: groupCallRoomId });
    } else {
      // Member leaving — only notifies peers, host call continues
      socketService.emit('room:webrtc:leave', { roomId: groupCallRoomId });
    }

    // Clean up all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    setPeers(new Map());

    // Stop local stream
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    dispatch(endGroupCall());
  };

  if (!groupCallRoomId) return null;

  // Grid layout
  const totalParticipants = peers.size + 1;
  const gridCols = totalParticipants <= 1 ? 1 : totalParticipants <= 4 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-zinc-200">Group Video Call</span>
            <span className="text-xs text-zinc-500">({totalParticipants} participant{totalParticipants !== 1 ? 's' : ''})</span>
          </div>

          {/* Pomodoro timer if active */}
          {activeTask && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-white/10">
              <span className="text-amber-400 font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
              <button
                onClick={() => isRunning ? dispatch(pausePomodoro()) : dispatch(resumePomodoro())}
                className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center hover:bg-amber-500/30 transition-colors"
              >
                <Timer size={10} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 hover:bg-zinc-700 transition-colors">
            <Settings size={14} />
          </button>
          <button
            onClick={handleEndCall}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="h-full gap-3"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridAutoRows: '1fr',
          }}
        >
          {/* Local video tile */}
          <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-zinc-300">
                  {user?.fullName?.substring(0, 2).toUpperCase() || 'ME'}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
              <span className="text-xs font-medium text-white">You</span>
              {!isAudioOn && <MicOff size={10} className="text-red-400" />}
            </div>
            {isHost && (
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-[blueviolet]/80 rounded-md text-[10px] font-bold text-white">HOST</div>
            )}
          </div>

          {/* Remote peer tiles */}
          {Array.from(peers.values()).map((peer) => (
            <div key={peer.userId} className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10">
              {peer.stream ? (
                <VideoTile stream={peer.stream} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-3">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-zinc-300">
                    {peer.userName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-zinc-500">Connecting…</span>
                </div>
              )}
              {peer.stream && !peer.isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-zinc-300">
                    {peer.userName.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                <span className="text-xs font-medium text-white truncate max-w-[100px]">{peer.userName}</span>
                {!peer.isAudioOn && <MicOff size={10} className="text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-center gap-4 py-5 flex-shrink-0 border-t border-white/5">
        {/* Mic */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all ${
            isAudioOn
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10'
              : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10'
          }`}
          title={isAudioOn ? 'Mute' : 'Unmute'}
        >
          {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${
            isVideoOn
              ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
              : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10'
          }`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <Camera size={20} /> : <CameraOff size={20} />}
        </button>

        {/* End call */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          title="Leave call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

// ── Remote video tile ──────────────────────────────────────────────────────────
const VideoTile: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};
