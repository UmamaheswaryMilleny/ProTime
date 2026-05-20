import React, { useState, useEffect } from 'react';
import { LeaderboardHeader } from '../../gamification/components/leaderboard/LeaderboardHeader';
import { TopThreeSpotlight } from '../../gamification/components/leaderboard/TopThreeSpotlight';
import { LeaderboardList } from '../../gamification/components/leaderboard/LeaderboardList';
import { CurrentUserStickyBar } from '../../gamification/components/leaderboard/CurrentUserStickyBar';
import { gamificationService } from '../../gamification/services/gamification.service';
import type { LeaderboardEntry } from '../../gamification/types';
import { useAppSelector } from '../../../store/hooks';
import { Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [filterType, setFilterType] = useState<'global' | 'friends'>('global');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await gamificationService.getLeaderboard(timeRange, filterType);
        setLeaderboard(response.data.leaderboard);
        setUserRank(response.data.userRank);
        setUserEntry(response.data.userEntry);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeRange, filterType]);

  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  // Check if current user is in the top 50 (leaderboard payload limit)
  const isUserInTop50 = leaderboard.some(entry => entry.userId === user?.id);

  const { width, height } = useWindowSize();

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b]">
        <Loader2 className="animate-spin text-indigo-500" size={60} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#09090b]">
      
      {/* Background Layer: Crackers / Confetti */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
        <Confetti
          width={width}
          height={height}
          recycle={true}
          numberOfPieces={150}
          gravity={0.05}
          wind={0.01}
        />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 pb-32">
        <LeaderboardHeader
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      {leaderboard.length > 0 ? (
        <>
          <TopThreeSpotlight topUsers={topThree} />
          
          <div className="mt-8">
            <LeaderboardList users={restOfList} currentUserId={user?.id} startRank={4} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 rounded-3xl border border-white/5">
          <span className="text-6xl mb-4">🏆</span>
          <h2 className="text-2xl font-bold text-white mb-2">No rankings available</h2>
          <p className="text-zinc-400">Be the first to complete tasks and claim the #1 spot!</p>
        </div>
      )}

      {/* Show sticky bar if user has an entry, but they are NOT in the top 50 */}
      {userEntry && !isUserInTop50 && userRank > 0 && (
        <CurrentUserStickyBar userEntry={userEntry} userRank={userRank} />
      )}
      </div>
    </div>
  );
};
