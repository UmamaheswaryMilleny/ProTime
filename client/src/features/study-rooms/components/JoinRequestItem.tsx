import React from 'react';
import { User, Check, X, Calendar } from 'lucide-react';
import type { RoomJoinRequestDTO } from '../api/studyRoomApi';

interface JoinRequestItemProps {
  request: RoomJoinRequestDTO;
  type: 'INVITATION' | 'JOIN_REQUEST';
  onAccept: () => void;
  onDecline: () => void;
}

export const JoinRequestItem: React.FC<JoinRequestItemProps> = ({ request, type, onAccept, onDecline }) => {
  const isInvitation = type === 'INVITATION';
  
  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-[blueviolet]/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isInvitation ? 'bg-[blueviolet]/10 text-[blueviolet]' : 'bg-zinc-800 text-zinc-400'}`}>
          <User size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {isInvitation ? (
              <>Invited to <span className="text-[blueviolet]">{request.roomName}</span></>
            ) : (
              <><span className="text-amber-500">{request.userName}</span> wants to join <span className="text-zinc-400 font-medium">{request.roomName}</span></>
            )}
          </h3>
          <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
            <Calendar size={10} />
            {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {request.isAlreadyParticipant ? (
          <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs font-bold border border-white/5 flex items-center gap-1.5">
            <Check size={14} className="text-zinc-600" />
            Already Joined
          </span>
        ) : (
          <>
            <button
              onClick={onAccept}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isInvitation 
                  ? 'bg-[blueviolet] text-white hover:bg-[blueviolet]/80 shadow-lg shadow-[blueviolet]/20'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              <Check size={14} />
              {isInvitation ? 'Join' : 'Accept'}
            </button>
            <button
              onClick={onDecline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
            >
              <X size={14} />
              {isInvitation ? 'Decline' : 'Reject'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
