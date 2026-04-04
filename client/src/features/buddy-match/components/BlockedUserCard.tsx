import React from 'react';
import { ShieldOff, User } from 'lucide-react';
import type { BuddyConnection } from '../types/buddy.types';

interface BlockedUserCardProps {
  connection: BuddyConnection;
  isUnblocking?: boolean;
  onUnblock: (connectionId: string, displayName?: string) => void;
}

export const BlockedUserCard: React.FC<BlockedUserCardProps> = ({
  connection,
  isUnblocking,
  onUnblock,
}) => {
  const buddy = connection.buddy;
  const displayName = buddy?.fullName || buddy?.username || 'Unknown User';
  const username = buddy?.username || '';
  const avatar = buddy?.profileImage;

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-zinc-800/60">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border border-white/10"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              img.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center ${avatar ? 'hidden' : ''}`}>
          <User size={22} className="text-zinc-500" />
        </div>
        {/* Blocked badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500/90 border border-zinc-900 flex items-center justify-center">
          <ShieldOff size={10} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
        {username && (
          <p className="text-xs text-zinc-500 truncate">@{username}</p>
        )}
        {buddy?.country && (
          <p className="text-xs text-zinc-600 mt-0.5 truncate">{buddy.country}</p>
        )}
      </div>

      {/* Unblock */}
      <button
        onClick={() => onUnblock(connection.id, buddy?.username || buddy?.fullName)}
        disabled={isUnblocking}
        className="flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUnblocking ? 'Unblocking…' : 'Unblock'}
      </button>
    </div>
  );
};
