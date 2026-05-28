import React from 'react';
import { Trophy, Users, Globe } from 'lucide-react';

interface LeaderboardHeaderProps {
  timeRange: 'today' | 'weekly' | 'monthly' | 'allTime';
  setTimeRange: (range: 'today' | 'weekly' | 'monthly' | 'allTime') => void;
  filterType: 'global' | 'friends';
  setFilterType: (type: 'global' | 'friends') => void;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  timeRange,
  setTimeRange,
  filterType,
  setFilterType,
}) => {
  // Silence unused variable compiler checks for commented out time filters
  void [timeRange, setTimeRange];

  return (
    <div className="flex flex-col items-center text-center gap-3 mb-6 sm:mb-8">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3">
          <Trophy className="text-yellow-400" size={24} />
          Leaderboard
        </h1>
        <p className="text-zinc-400 mt-1 text-xs sm:text-sm">See how you rank among top performers</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Global vs Friends */}
        <div className="flex bg-zinc-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilterType('global')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filterType === 'global'
                ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe size={14} />
            Global
          </button>
          <button
            onClick={() => setFilterType('friends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filterType === 'friends'
                ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            Buddies
          </button>
        </div>

        {/* Time Range Selector - Commented out as requested
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-zinc-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[blueviolet] transition-colors"
        >
          <option value="today">Today</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="allTime">All Time</option>
        </select>
        */}
      </div>
    </div>
  );
};
