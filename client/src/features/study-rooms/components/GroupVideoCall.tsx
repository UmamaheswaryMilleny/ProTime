import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { endGroupCall } from '../store/studyRoomSlice';
import { socketService } from '../../../shared/services/socketService';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, MessageSquare, Settings, Timer } from 'lucide-react';
import { pausePomodoro, resumePomodoro } from '../../todo/store/pomodoroSlice';

interface PeerConnection {
  userId: string;
  userName: string;
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const GroupVideoCall: React.FC = () => {
  const dispatch = useAppDispatch();
  const { groupCallRoomId, activeRoom } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);
  const { activeTask, isRunning, timeRemaining } = useAppSelector(s => s.pomodoro);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Initialize local stream
  useEffect(() => {
    if (!groupCallRoomId) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('[GroupVideo] Failed to get media:', err);
        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setLocalStream(audioStream);
          setIsVideoOn(false);
        } catch {
          console.error('[GroupVideo] Failed to get any media');
        }
      }
    };

    initMedia();

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
    };
  }, [groupCallRoomId]);

  // Socket listeners for WebRTC signaling
  useEffect(() => {
    if (!groupCallRoomId || !localStream) return;

    const handleOffer = async (data: { senderId: string; roomId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.roomId !== groupCallRoomId) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketService.emit('room:webrtc:ice-candidate', {
            targetUserId: data.senderId,
            roomId: groupCallRoomId,
            candidate: e.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (e) => {
        const peerConn = peersRef.current.get(data.senderId);
        if (peerConn) {
          peerConn.stream = e.streams[0];
          peersRef.current.set(data.senderId, peerConn);
          setPeers(new Map(peersRef.current));
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const peerConn: PeerConnection = { userId: data.senderId, userName: data.senderId.slice(0, 6), pc };
      peersRef.current.set(data.senderId, peerConn);
      setPeers(new Map(peersRef.current));

      socketService.emit('room:webrtc:answer', {
        targetUserId: data.senderId,
        roomId: groupCallRoomId,
        answer,
      });
    };

    const handleAnswer = async (data: { senderId: string; roomId: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const handleIceCandidate = async (data: { senderId: string; roomId: string; candidate: RTCIceCandidateInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    socketService.on('room:webrtc:offer', handleOffer);
    socketService.on('room:webrtc:answer', handleAnswer);
    socketService.on('room:webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socketService.off('room:webrtc:offer', handleOffer);
      socketService.off('room:webrtc:answer', handleAnswer);
      socketService.off('room:webrtc:ice-candidate', handleIceCandidate);
    };
  }, [groupCallRoomId, localStream]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsAudioOn(!isAudioOn);
      socketService.emit('room:webrtc:mic-toggle', { roomId: groupCallRoomId, isAudioOn: !isAudioOn });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOn(!isVideoOn);
      socketService.emit('room:webrtc:camera-toggle', { roomId: groupCallRoomId, isVideoOn: !isVideoOn });
    }
  };

  const handleEndCall = () => {
    // Clean up all peer connections
    peersRef.current.forEach((peer) => {
      peer.pc.close();
    });
    peersRef.current.clear();
    setPeers(new Map());

    // Stop local stream
    localStream?.getTracks().forEach(t => t.stop());
    setLocalStream(null);

    dispatch(endGroupCall());
  };

  if (!groupCallRoomId) return null;

  // Calculate grid layout
  const totalParticipants = peers.size + 1; // +1 for self
  const gridCols = totalParticipants <= 1 ? 1 : totalParticipants <= 4 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Timer */}
          {activeTask && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-white/10">
              <span className="text-amber-400 font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
              <button
                onClick={() => isRunning ? dispatch(pausePomodoro()) : dispatch(resumePomodoro())}
                className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
              >
                <Timer size={10} className="text-white" />
              </button>
            </div>
          )}

          <button className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10 hover:bg-zinc-700 transition-colors">
            NotePad
          </button>

          <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 hover:bg-zinc-700 transition-colors">
            <Settings size={14} />
          </button>
        </div>

        <button
          onClick={handleEndCall}
          className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
        >
          End Call
        </button>
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
          {/* Local video */}
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
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-zinc-400">
                  {user?.fullName?.substring(0, 2).toUpperCase() || 'ME'}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
              You
            </div>
          </div>

          {/* Remote peers */}
          {Array.from(peers.values()).map((peer) => (
            <div key={peer.userId} className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10">
              {peer.stream ? (
                <VideoTile stream={peer.stream} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-zinc-400">
                    {peer.userName.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                {peer.userName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom timer */}
      {activeTask && (
        <div className="text-center py-1">
          <span className="text-amber-400 font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-center gap-3 py-4 flex-shrink-0">
        <button
          onClick={toggleAudio}
          className={`p-3.5 rounded-full transition-colors ${
            isAudioOn
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-full transition-colors ${
            isVideoOn
              ? 'bg-[blueviolet] text-white'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isVideoOn ? <Camera size={18} /> : <CameraOff size={18} />}
        </button>

        <button className="p-3.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10 transition-colors">
          <Timer size={18} />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="p-3.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10 transition-colors"
        >
          <MessageSquare size={18} />
        </button>

        <button
          onClick={handleEndCall}
          className="p-3.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
};

// Helper component to display remote video stream
const VideoTile: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
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
