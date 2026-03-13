import { X, Check } from 'lucide-react';
import type { BuddyProfile, BuddyConnectionStatus } from '../types/buddy.types';

interface BuddyCardProps {
  buddy: BuddyProfile;
  status?: BuddyConnectionStatus | 'NONE';
  onAction: (action: 'send' | 'accept' | 'decline' | 'chat' | 'video' | 'view') => void;
  isLoading?: boolean;
}

export const BuddyCard: React.FC<BuddyCardProps> = ({ 
  buddy, 
  status = 'NONE', 
  onAction, 
  isLoading = false
}) => {
  if (!buddy) return null;

  const avatarUrl = buddy.profileImage || buddy.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(buddy.fullName)}&background=8A2BE2&color=fff`;

  return (
    <div className="bg-[#18181B] border border-white/5 rounded-[24px] p-5 transition-all duration-300 relative group hover:border-[blueviolet]/30 hover:shadow-2xl hover:shadow-[blueviolet]/5 flex flex-col h-full">
      {/* Top Section: Avatar and Info */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="relative shrink-0">
            <img 
              src={avatarUrl} 
              alt={buddy.fullName} 
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[blueviolet]/20"
            />
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-[#18181B] rounded-full" />
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="text-white font-bold text-sm truncate pr-1">
              @{buddy.username || buddy.fullName.toLowerCase().replace(/\s+/g, '_')}
            </h3>
            <p className="text-zinc-500 text-[11px] font-medium truncate mt-0.5">{buddy.country}</p>
          </div>
        </div>
        
        <button 
          className="shrink-0 p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          title="Ignore"
          onClick={() => onAction('decline')}
        >
          <X size={14} />
        </button>
      </div>

      {/* Bio Section */}
      <div className="mb-6 flex-grow">
        <p className="text-zinc-400 text-[12px] leading-relaxed line-clamp-2 italic">
          "{buddy.bio || "Connect With Like-Minded Learners Who Share Your Goals"}"
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex gap-2.5 mt-auto">
        <button 
          onClick={() => onAction('view')}
          className="flex-1 py-2.5 rounded-xl border border-white/5 text-zinc-300 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all text-center"
        >
          View Profile
        </button>

        {status === 'NONE' && (
          <button 
            disabled={isLoading}
            onClick={() => onAction('send')}
            className="flex-1 py-2.5 rounded-xl bg-[blueviolet] hover:bg-[#7c2ae8] text-white text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[blueviolet]/20 active:scale-95"
          >
            {isLoading ? '...' : 'Send Request'}
          </button>
        )}

        {status === 'SENT' && (
          <button 
            disabled
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <Check size={12} /> Sent
          </button>
        )}

        {status === 'PENDING' && (
          <button 
            onClick={() => onAction('accept')}
            className="flex-1 py-2.5 rounded-xl bg-[blueviolet] hover:bg-[#7c2ae8] text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-[blueviolet]/20"
          >
            Accept
          </button>
        )}

        {status === 'CONNECTED' && (
          <button 
            onClick={() => onAction('chat')}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
};
