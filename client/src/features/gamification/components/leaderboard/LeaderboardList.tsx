import React from 'react';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';

interface LeaderboardListProps {
  users: LeaderboardEntry[];
  currentUserId?: string;
  startRank?: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ users, currentUserId, startRank = 1 }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/5">
        <p className="text-zinc-400 text-sm px-4">No rankings yet. Start completing tasks to climb the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative z-10">
      {users.map((user, index) => {
        const rank = startRank + index;
        const isCurrentUser = user.userId === currentUserId;

        // Mocking rank changes since our backend doesn't store previous ranks yet
        const rankChange = index % 5 === 0 ? 'up' : index % 7 === 0 ? 'down' : 'same';

        return (
          <div
            key={user.userId}
            className={`flex items-center justify-between px-3 py-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 ${
              isCurrentUser
                ? 'bg-gradient-to-r from-[blueviolet]/30 to-zinc-800/80 backdrop-blur-md border border-[blueviolet]/50 shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.5)] z-10'
                : 'bg-zinc-800/40 backdrop-blur-sm border border-white/5 hover:bg-zinc-800/70 hover:border-white/10 hover:shadow-xl'
            }`}
          >
            {/* Left: Rank + Avatar + Name */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Rank number */}
              <div className="flex flex-col items-center justify-center w-7 sm:w-10 shrink-0">
                <span className={`text-sm sm:text-lg font-black ${isCurrentUser ? 'text-white' : 'text-slate-500'}`}>
                  #{rank}
                </span>
                {rankChange === 'up' && <TrendingUp size={10} className="text-emerald-500 mt-0.5 animate-bounce" />}
                {rankChange === 'down' && <TrendingDown size={10} className="text-red-500 mt-0.5" />}
                {rankChange === 'same' && <Minus size={10} className="text-slate-600 mt-0.5" />}
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden flex items-center justify-center ${isCurrentUser ? 'border-[blueviolet] shadow-[0_0_10px_rgba(138,43,226,0.8)]' : 'border-zinc-600 bg-zinc-900'}`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm sm:text-lg font-bold text-slate-300">{user.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Name + Level */}
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-sm sm:text-base truncate ${isCurrentUser ? 'bg-gradient-to-r from-[blueviolet] to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm' : 'text-slate-200'}`}>
                  {user.username} {isCurrentUser && <span className="text-[10px] text-[blueviolet] font-semibold">(You)</span>}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold truncate">
                  Lv{user.currentLevel} <span className="text-slate-400">•</span> {user.currentTitle}
                </span>
              </div>
            </div>

            {/* Right: Streak + XP */}
            <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-2">
              {/* Streak — hidden on very small, shown from sm */}
              <div className="hidden xs:flex sm:flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/20 px-2 py-1 rounded-lg shadow-inner">
                <Flame size={12} className="text-orange-500 animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="text-xs font-semibold text-orange-400">{user.currentStreak}<span className="hidden sm:inline text-[10px] font-medium text-orange-500/80"> d</span></span>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className={`font-black text-base sm:text-xl drop-shadow-sm ${isCurrentUser ? 'text-white' : 'text-slate-100'}`}>
                  {user.totalXp.toLocaleString()}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">XP</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
