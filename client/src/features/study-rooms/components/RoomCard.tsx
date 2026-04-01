import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Lock, Video, Monitor, Clock } from 'lucide-react';
import type { StudyRoomDTO } from '../api/studyRoomApi';
import { ROUTES } from '../../../shared/constants/constants.routes';

interface RoomCardProps {
  room: StudyRoomDTO;
  currentUserId: string;
  onJoin: (roomId: string) => void;
  onRequest: (roomId: string) => void;
  isJoining?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, currentUserId, onJoin, onRequest, isJoining }) => {
  const navigate = useNavigate();
  const isHost = room.hostId === currentUserId;
  const isParticipant = room.participantIds.includes(currentUserId);
  const isMember = isHost || isParticipant;
  const isFull = room.participantIds.length >= room.maxParticipants;
  const isLive = room.status === 'LIVE';
  const isWaiting = room.status === 'WAITING';
  const isEnded = room.status === 'ENDED';
  const hasAlreadyStarted = !room.startTime || room.startTime === 'IMMEDIATE' || new Date(room.startTime) <= new Date();
  
  const isPast = room.endTime 
    ? new Date(room.endTime) < new Date() 
    : (room.startTime ? new Date(room.startTime).getTime() + (4 * 60 * 60 * 1000) < Date.now() : false);
  const isExpired = isEnded || (isPast && !isLive);

  const handleAction = () => {
    if (isExpired) return;
    if (isMember) {
      if (!isLive && !hasAlreadyStarted) return;
      navigate(ROUTES.DASHBOARD_STUDY_ROOMS + `/${room.id}`);
      return;
    }
    if (room.type === 'PUBLIC') {
      onJoin(room.id);
    } else {
      onRequest(room.id);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{room.name}</h3>
          {room.type === 'PUBLIC' ? (
            <Globe size={14} className="text-zinc-400 flex-shrink-0" />
          ) : (
            <Lock size={14} className="text-zinc-400 flex-shrink-0" />
          )}
        </div>
        {isLive && (
          <span className="flex-shrink-0 px-2.5 py-0.5 bg-[blueviolet]/20 text-[blueviolet] text-[10px] font-semibold rounded-full border border-[blueviolet]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[blueviolet] animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{room.description}</p>
      )}

      {/* Participants */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Users size={13} className="text-zinc-400" />
          <span>{room.participantIds.length || 1} / {room.maxParticipants} Joined</span>
        </div>
        {isHost && (
          <span className="text-[10px] text-[blueviolet] font-medium bg-[blueviolet]/10 px-2 py-0.5 rounded-full">Host</span>
        )}
      </div>

      {/* Features */}
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="text-xs text-zinc-500">Pomodoro</span>
        {room.features?.includes('VIDEO') && <Video size={16} className="text-[blueviolet]" />}
        {room.features?.includes('CHAT') && <Monitor size={16} className="text-zinc-400" />}
      </div>

      {/* Tags */}
      {room.tags && room.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {room.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full border border-white/10 text-zinc-300 text-[10px] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Level & Start Time */}
      <div className="flex flex-col gap-1">
        {room.levelRequired && (
          <p className="text-[11px] text-zinc-500">Level required : {room.levelRequired}</p>
        )}
        {room.startTime && (
          <p className="text-[11px] text-[blueviolet] font-medium flex items-center gap-1">
            <Clock size={10} />
            Starts: {new Date(room.startTime).toLocaleString([], { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}
          </p>
        )}
        {room.endTime && (
          <p className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Clock size={10} />
            Ends: {new Date(room.endTime).toLocaleString([], { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}
          </p>
        )}
      </div>

      {/* Host */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-zinc-700 border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-300 flex-shrink-0">
          {(room.hostName || 'H').substring(0, 2).toUpperCase()}
        </div>
        <span className="text-[11px] text-zinc-400">Hosted by @{room.hostName || 'Unknown'}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={isJoining || (isExpired) || (isFull && !isMember) || (isMember && isWaiting && !hasAlreadyStarted)}
        className={`mt-1 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isExpired
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
            : isMember
            ? (isWaiting && !hasAlreadyStarted)
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-white/5'
              : 'bg-[blueviolet] text-white hover:bg-[blueviolet]/80 shadow-lg shadow-[blueviolet]/20'
            : room.type === 'PUBLIC'
            ? isFull
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-[blueviolet] text-white hover:bg-[blueviolet]/80 shadow-lg shadow-[blueviolet]/20'
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10'
        }`}
      >
        {isJoining
          ? 'Joining...'
          : isExpired
          ? 'Expired'
          : isMember
          ? (isWaiting && !hasAlreadyStarted)
            ? 'Joined Room' 
            : 'Enter Room'
          : room.type === 'PUBLIC'
          ? isFull
            ? 'Full'
            : 'Join Now'
          : 'Request Access'}
      </button>
    </div>
  );
};
