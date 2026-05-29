import React from 'react';
import { Crown, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';

interface TopThreeSpotlightProps {
  topUsers: LeaderboardEntry[];
}

export const TopThreeSpotlight: React.FC<TopThreeSpotlightProps> = ({ topUsers }) => {
  if (topUsers.length === 0) return null;

  const rank1 = topUsers[0];
  const rank2 = topUsers[1];
  const rank3 = topUsers[2];

  return (
    <div className="flex flex-col items-center gap-3 mb-8 mt-4 md:mb-12 md:mt-8">
      {/* Rank 1 always on top in mobile only */}
      {rank1 && (
        <div className="md:hidden flex flex-col items-center z-20 animate-[float_5s_ease-in-out_infinite] hover:scale-[1.03] transition-transform duration-300 w-full max-w-[180px]">
          <Crown className="text-yellow-400 mb-1.5 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse" size={32} />
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-spin" style={{ animationDuration: '4s' }}></div>
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)]">
              {rank1.avatar ? (
                <img 
                  src={rank1.avatar} 
                  alt={rank1.username} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    img.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`text-2xl md:text-4xl font-bold text-yellow-400 ${rank1.avatar ? 'hidden' : ''}`}>
                {rank1.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 font-black w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-lg shadow-[0_0_15px_rgba(250,204,21,0.6)] border-2 md:border-4 border-zinc-900">
              1
            </div>
          </div>
          <div className="mt-5 text-center bg-gradient-to-b from-yellow-500/20 to-zinc-900/80 backdrop-blur-xl border border-yellow-400/40 rounded-2xl px-4 py-3 md:p-5 w-full flex flex-col items-center shadow-2xl shadow-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            <span className="font-bold text-sm md:text-lg text-white truncate w-full text-center drop-shadow-md">{rank1.username}</span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-yellow-400 mt-1 font-bold truncate w-full text-center">{rank1.currentTitle} • Lvl {rank1.currentLevel}</span>
            <div className="mt-2 font-black text-yellow-400 text-xl md:text-3xl flex items-center gap-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              <span>{rank1.totalXp.toLocaleString()}</span> <span className="text-xs font-bold text-yellow-500/80">XP</span>
            </div>
            <div className="mt-1.5 text-xs text-orange-400 font-bold flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30">
              <Flame size={11} className="animate-pulse" /> {rank1.currentStreak} Days
            </div>
          </div>
        </div>
      )}

      {/* Rank 2 & 3 side by side on mobile */}
      <div className="flex flex-row items-end justify-center gap-3 w-full md:hidden">
        {/* Rank 2 */}
        {rank2 && (
          <div className="flex flex-col items-center animate-[float_6s_ease-in-out_infinite] hover:scale-105 transition-transform duration-300 flex-1 max-w-[150px]">
            <div className="relative group">
              <div className="w-14 h-14 rounded-full border-3 border-slate-300 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                {rank2.avatar ? (
                  <img 
                    src={rank2.avatar} 
                    alt={rank2.username} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-xl font-bold text-slate-300 ${rank2.avatar ? 'hidden' : ''}`}>
                  {rank2.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-zinc-900">
                2
              </div>
            </div>
            <div className="mt-4 text-center bg-zinc-800/60 backdrop-blur-md border border-slate-300/20 rounded-xl px-2 py-2.5 w-full flex flex-col items-center shadow-xl shadow-slate-400/5">
              <span className="font-semibold text-xs text-white truncate w-full text-center">{rank2.username}</span>
              <span className="text-[8px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider truncate w-full text-center">{rank2.currentTitle} • Lv{rank2.currentLevel}</span>
              <div className="mt-1.5 font-bold text-slate-200 text-base flex items-center gap-0.5">
                <span>{rank2.totalXp.toLocaleString()}</span> <span className="text-[9px] font-normal text-slate-400">XP</span>
              </div>
              <div className="mt-1 text-[10px] text-orange-400 flex items-center gap-0.5 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                <Flame size={9} className="animate-pulse" /> {rank2.currentStreak}d
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {rank3 && (
          <div className="flex flex-col items-center animate-[float_7s_ease-in-out_infinite] hover:scale-105 transition-transform duration-300 flex-1 max-w-[150px]">
            <div className="relative group">
              <div className="w-14 h-14 rounded-full border-3 border-amber-700 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                {rank3.avatar ? (
                  <img 
                    src={rank3.avatar} 
                    alt={rank3.username} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-xl font-bold text-amber-700 ${rank3.avatar ? 'hidden' : ''}`}>
                  {rank3.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-zinc-900">
                3
              </div>
            </div>
            <div className="mt-4 text-center bg-zinc-800/60 backdrop-blur-md border border-amber-700/20 rounded-xl px-2 py-2.5 w-full flex flex-col items-center shadow-xl shadow-amber-900/10">
              <span className="font-semibold text-xs text-white truncate w-full text-center">{rank3.username}</span>
              <span className="text-[8px] uppercase font-bold text-amber-600/80 mt-0.5 tracking-wider truncate w-full text-center">{rank3.currentTitle} • Lv{rank3.currentLevel}</span>
              <div className="mt-1.5 font-bold text-amber-600 text-base flex items-center gap-0.5">
                <span>{rank3.totalXp.toLocaleString()}</span> <span className="text-[9px] font-normal text-amber-700/80">XP</span>
              </div>
              <div className="mt-1 text-[10px] text-orange-400 flex items-center gap-0.5 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                <Flame size={9} className="animate-pulse" /> {rank3.currentStreak}d
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout: side-by-side all three */}
      <div className="hidden md:flex flex-row items-end justify-center gap-8 w-full">
        {/* Rank 2 */}
        {rank2 && (
          <div className="flex flex-col items-center animate-[float_6s_ease-in-out_infinite] hover:scale-105 transition-transform duration-300">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.3)] group-hover:shadow-[0_0_30px_rgba(148,163,184,0.6)] transition-all">
                {rank2.avatar ? (
                  <img 
                    src={rank2.avatar} 
                    alt={rank2.username} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-2xl font-bold text-slate-300 ${rank2.avatar ? 'hidden' : ''}`}>
                  {rank2.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md border-2 border-zinc-900">
                2
              </div>
            </div>
            <div className="mt-4 text-center bg-zinc-800/60 backdrop-blur-md border border-slate-300/20 rounded-2xl p-4 w-40 flex flex-col items-center shadow-xl shadow-slate-400/5 group">
              <span className="font-semibold text-white truncate w-full group-hover:text-slate-300 transition-colors">{rank2.username}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">{rank2.currentTitle} • Lvl {rank2.currentLevel}</span>
              <div className="mt-3 font-bold text-slate-200 text-xl flex items-center gap-1 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]">
                <span>{rank2.totalXp.toLocaleString()}</span> <span className="text-xs font-normal text-slate-400">XP</span>
              </div>
              <div className="mt-2 text-xs text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                <Flame size={12} className="animate-pulse" /> {rank2.currentStreak} Days
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 desktop */}
        {rank1 && (
          <div className="flex flex-col items-center z-20 animate-[float_5s_ease-in-out_infinite] mb-4 hover:scale-[1.05] transition-transform duration-300">
            <Crown className="text-yellow-400 mb-2 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse" size={44} />
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-spin" style={{ animationDuration: '4s' }}></div>
              <div className="relative w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                {rank1.avatar ? (
                  <img 
                    src={rank1.avatar} 
                    alt={rank1.username} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-4xl font-bold text-yellow-400 ${rank1.avatar ? 'hidden' : ''}`}>
                  {rank1.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 font-black w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-[0_0_15px_rgba(250,204,21,0.6)] border-4 border-zinc-900">
                1
              </div>
            </div>
            <div className="mt-6 text-center bg-gradient-to-b from-yellow-500/20 to-zinc-900/80 backdrop-blur-xl border border-yellow-400/40 rounded-2xl p-5 w-48 flex flex-col items-center shadow-2xl shadow-yellow-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              <span className="font-bold text-lg text-white truncate w-full drop-shadow-md">{rank1.username}</span>
              <span className="text-[10px] uppercase tracking-widest text-yellow-400 mt-1 font-bold">{rank1.currentTitle} • Lvl {rank1.currentLevel}</span>
              <div className="mt-3 font-black text-yellow-400 text-3xl flex items-center gap-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                <span>{rank1.totalXp.toLocaleString()}</span> <span className="text-xs font-bold text-yellow-500/80">XP</span>
              </div>
              <div className="mt-2 text-xs text-orange-400 font-bold flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                <Flame size={14} className="animate-pulse" /> {rank1.currentStreak} Days
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 desktop */}
        {rank3 && (
          <div className="flex flex-col items-center animate-[float_7s_ease-in-out_infinite] hover:scale-105 transition-transform duration-300">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-4 border-amber-700 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-[0_0_20px_rgba(180,83,9,0.3)] group-hover:shadow-[0_0_30px_rgba(180,83,9,0.6)] transition-all">
                {rank3.avatar ? (
                  <img 
                    src={rank3.avatar} 
                    alt={rank3.username} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-2xl font-bold text-amber-700 ${rank3.avatar ? 'hidden' : ''}`}>
                  {rank3.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md border-2 border-zinc-900">
                3
              </div>
            </div>
            <div className="mt-4 text-center bg-zinc-800/60 backdrop-blur-md border border-amber-700/20 rounded-2xl p-4 w-40 flex flex-col items-center shadow-xl shadow-amber-900/10 group">
              <span className="font-semibold text-white truncate w-full group-hover:text-amber-500 transition-colors">{rank3.username}</span>
              <span className="text-[10px] uppercase font-bold text-amber-600/80 mt-1 tracking-wider">{rank3.currentTitle} • Lvl {rank3.currentLevel}</span>
              <div className="mt-3 font-bold text-amber-600 text-xl flex items-center gap-1 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]">
                <span>{rank3.totalXp.toLocaleString()}</span> <span className="text-xs font-normal text-amber-700/80">XP</span>
              </div>
              <div className="mt-2 text-xs text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                <Flame size={12} className="animate-pulse" /> {rank3.currentStreak} Days
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
