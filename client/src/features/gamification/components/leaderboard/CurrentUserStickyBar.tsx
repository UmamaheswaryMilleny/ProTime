import React from 'react';
import type { LeaderboardEntry } from '../../types';

interface CurrentUserStickyBarProps {
  userEntry: LeaderboardEntry;
  userRank: number;
}

export const CurrentUserStickyBar: React.FC<CurrentUserStickyBarProps> = ({ userEntry, userRank }) => {
  // Mock logic to show next rank XP difference
  // In a real app, backend would return the user directly ahead
  const nextRankXpNeeded = Math.floor(userEntry.totalXp * 1.1) - userEntry.totalXp + 50;

  return (
    <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-zinc-900/95 backdrop-blur-md border-t border-[blueviolet]/30 shadow-[0_-10px_40px_rgba(138,43,226,0.1)] z-30 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full border-2 border-[blueviolet] overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
            {userEntry.avatar ? (
              <img src={userEntry.avatar} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-[blueviolet]">Y</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg">Your Rank: #{userRank}</span>
            <span className="text-sm text-zinc-400">
              Lvl {userEntry.currentLevel} • {userEntry.currentTitle}
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-1/2 items-end">
          <div className="flex justify-between w-full text-xs text-zinc-400 mb-1.5">
            <span>Current: <strong className="text-white">{userEntry.totalXp.toLocaleString()} XP</strong></span>
            <span>Next Rank: <strong className="text-[blueviolet]">+{nextRankXpNeeded.toLocaleString()} XP</strong></span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
            <div 
               className="h-full bg-gradient-to-r from-blue-600 to-[blueviolet] rounded-full relative"
               style={{ width: '65%' }} // Mocked progress
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 italic">
            "You need {nextRankXpNeeded} XP to reach Rank #{userRank - 1}"
          </p>
        </div>

      </div>
    </div>
  );
};
