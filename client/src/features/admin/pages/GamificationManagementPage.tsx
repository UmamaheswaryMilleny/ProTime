import React, { useState, useEffect } from 'react';
import {
  useGamificationOverview,
  useGamificationUsers,
  useGamificationLeaderboard,
  useGamificationBadges,
  useToggleBadgeStatus,
  useGamificationUserDetail,
  gamificationKeys,
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge
} from '../api/useAdminGamification';
import {
  Gamepad2, Users, Trophy, BarChart3, Star, Zap, Search, Calendar, X,
  ChevronLeft, ChevronRight, AlertCircle, Crown, Plus, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';

export const GamificationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'badges' | 'leaderboard'>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Users Filters
  const [userFilters, setUserFilters] = useState({ page: 1, limit: 10, search: '', level: '', title: '', sortBy: 'xp' });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search into filters
  useEffect(() => {
    setUserFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Leaderboard Filters
  const [leaderboardFilters, setLeaderboardFilters] = useState({ page: 1, limit: 10, period: 'all-time', plan: 'all' });

  // Data fetching
  const { data: overview, isLoading: overviewLoading } = useGamificationOverview();
  const { data: usersData, isLoading: usersLoading } = useGamificationUsers(userFilters);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useGamificationLeaderboard(leaderboardFilters);
  const { data: badgesData, isLoading: badgesLoading } = useGamificationBadges();
  const queryClient = useQueryClient();
  const toggleBadge = useToggleBadgeStatus();

  const handleToggleBadge = (badgeId: string) => {
    toggleBadge.mutate(badgeId, {
      onSuccess: () => {
        toast.success('Badge status updated');
        // Also invalidate overview so badge stats refresh
        queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      },
      onError: () => toast.error('Failed to update badge'),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Gamepad2 className="text-[#2563EB]" size={20} /> Gamification Management
        </h1>
        <p className="text-[#A1A1AA] text-xs sm:text-sm">
          Overview of user XP, levels, badges, and streaks across the platform.
        </p>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 sm:gap-4 border-b border-zinc-800 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'badges', label: 'Badges', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-zinc-700'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewTab data={overview} isLoading={overviewLoading} />
        )}

        {activeTab === 'users' && (
          <UsersTab
            data={usersData}
            isLoading={usersLoading}
            filters={userFilters}
            setFilters={setUserFilters}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onRowClick={(userId: string) => setSelectedUserId(userId)}
          />
        )}

        {activeTab === 'badges' && (
          <BadgesTab 
            data={badgesData} 
            isLoading={badgesLoading} 
            onToggleBadge={handleToggleBadge}
            isToggling={toggleBadge.isPending}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab
            data={leaderboardData}
            isLoading={leaderboardLoading}
            filters={leaderboardFilters}
            setFilters={setLeaderboardFilters}
          />
        )}
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedUserId && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUserId(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#0D0D10] border-l border-zinc-800 z-50 overflow-y-auto flex flex-col shadow-2xl"
            >
              <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Subcomponents ─────────────────────────────────────────────────────────────

const OverviewTab = ({ data, isLoading }: any) => {
  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#18181B] p-5 rounded-2xl border border-zinc-800/60 h-24 animate-pulse" />
      ))}
    </div>
  );
  if (!data) return null;

  const maxLevelCount = Math.max(...(data.levelDistribution.map((d: any) => d.count) || [0]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total XP Earned" value={data.totalXpEarned.toLocaleString()} subtext="platform total" icon={Zap} color="emerald" />
        <SummaryCard title="Avg XP Per User" value={data.avgXpPerUser.toLocaleString()} subtext="per user" icon={Users} color="blue" />
        <SummaryCard title="Badges Awarded" value={data.totalBadgesAwarded.toLocaleString()} subtext="all time" icon={Trophy} color="amber" />
        <SummaryCard title="Active Streaks" value={data.activeStreaksCount.toLocaleString()} subtext="streak > 0" icon={Calendar} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution Bar Chart */}
        <div className="bg-[#18181B] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-6">Level Distribution</h3>
          {data.levelDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-zinc-600 text-sm">No data yet</div>
          ) : (
            <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2">
              {data.levelDistribution.map((dist: any) => (
                <div key={dist.level} className="flex-1 flex flex-col justify-end items-center group relative min-w-[30px]">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 text-white">
                    Level {dist.level}: {dist.count} users
                  </div>
                  <div
                    className="w-full bg-[#2563EB] rounded-t-sm transition-all duration-500 ease-out hover:brightness-125"
                    style={{ height: `${(dist.count / maxLevelCount) * 100}%`, minHeight: dist.count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-[10px] text-zinc-500 mt-2">L{dist.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Badges */}
        <div className="bg-[#18181B] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-6">Top Badges Awarded</h3>
          {data.topBadges.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">No badges awarded yet</div>
          ) : (
            <div className="space-y-4">
              {data.topBadges.map((badge: any, idx: number) => {
                const maxCount = data.topBadges[0]?.count || 1;
                const pct = (badge.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#A1A1AA]">
                      <span className="text-white">{badge.badgeName}</span>
                      <span>{badge.count.toLocaleString()} users</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Badge Awards */}
      {data.recentBadgeAwards?.length > 0 && (
        <div className="bg-[#18181B] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Badge Awards</h3>
          <div className="space-y-2">
            {data.recentBadgeAwards.map((award: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">🏆</div>
                  <div>
                    <p className="text-sm font-medium text-white">{award.fullName}</p>
                    <p className="text-xs text-zinc-500">{award.badgeName}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">{new Date(award.earnedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon, color }: any) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue:    'bg-blue-500/10 text-blue-400',
    amber:   'bg-amber-500/10 text-amber-400',
    orange:  'bg-orange-500/10 text-orange-400',
  };
  return (
    <div className="bg-[#18181B] p-5 rounded-2xl border border-zinc-800/60 flex items-start justify-between shadow-sm hover:border-zinc-700 transition-colors">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-[11px] text-zinc-500">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorMap[color] || 'bg-zinc-800/50 text-zinc-400'}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

const UsersTab = ({ data, isLoading, filters, setFilters, searchInput, setSearchInput, onRowClick }: any) => {
  const totalPages = data?.total ? Math.ceil(data.total / filters.limit) : 1;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search user by name or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-[#18181B] border border-zinc-800/60 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
        <select
          value={filters.level} onChange={e => setFilters({ ...filters, level: e.target.value, page: 1 })}
          className="bg-[#18181B] border border-zinc-800/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Levels</option>
          {[...Array(20)].map((_, i) => <option key={i} value={i + 1}>Level {i + 1}</option>)}
        </select>
        <select
          value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
          className="bg-[#18181B] border border-zinc-800/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="xp">Sort: XP High→Low</option>
          <option value="streak">Sort: Streak High→Low</option>
          <option value="badges">Sort: Badges High→Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.users?.length ? (
          <div className="p-16 text-center">
            <Users size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs uppercase bg-[#0D0D10] text-[#A1A1AA] border-b border-zinc-800/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Level / Title</th>
                  <th className="px-6 py-4 font-semibold text-right">Total XP</th>
                  <th className="px-6 py-4 font-semibold text-right">Streak</th>
                  <th className="px-6 py-4 font-semibold text-center">Badges</th>
                  <th className="px-6 py-4 font-semibold text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.users.map((user: any) => (
                  <tr
                    key={user.userId}
                    onClick={() => onRowClick(user.userId)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.fullName}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded text-xs font-bold">Lvl {user.currentLevel}</span>
                        <span className="text-zinc-300">{user.currentTitle || 'Beginner'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-emerald-400">
                      {(user.totalXp || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.currentStreak > 0 ? (
                        <span className="text-orange-400 font-medium">🔥 {user.currentStreak} days</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-zinc-800/50 text-white px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-700/50">
                        {user.badgeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      {user.lastActiveAt && user.lastActiveAt !== '1970-01-01T00:00:00.000Z'
                        ? new Date(user.lastActiveAt).toLocaleDateString()
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
        <span>
          {data?.total > 0 && (
            <>
              Showing <span className="text-white font-medium">{(filters.page - 1) * filters.limit + 1}</span> –{' '}
              <span className="text-white font-medium">{Math.min(filters.page * filters.limit, data.total)}</span>{' '}
              of <span className="text-white font-medium">{data.total}</span> users
            </>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="p-1.5 bg-[#18181B] border border-zinc-800 disabled:opacity-40 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-zinc-400 px-1">Page {filters.page} of {totalPages}</span>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="p-1.5 bg-[#18181B] border border-zinc-800 disabled:opacity-40 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Side Panel Content ───────────────────────────────────────────────────────
const UserDetailPanel = ({ userId, onClose }: { userId: string, onClose: () => void }) => {
  const { data, isLoading, isError } = useGamificationUserDetail(userId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-red-400">
        <AlertCircle size={28} />
        <p className="text-sm font-medium">Failed to load user data.</p>
        <button onClick={onClose} className="text-xs underline text-zinc-500 hover:text-white">Close</button>
      </div>
    );
  }

  const { user, gamification, badges } = data;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-[#121215]">
        <div>
          <h2 className="text-xl font-bold text-white mb-1.5">{user.fullName}</h2>
          <p className="text-xs text-zinc-500 mb-2">{user.email}</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
            user.isPremium
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
          }`}>
            {user.isPremium ? '⚡ Premium' : 'Free User'}
          </span>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800 transition">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-5">
        {!gamification ? (
          <div className="p-4 rounded-xl bg-zinc-800/30 text-zinc-500 text-sm text-center">
            No gamification record found for this user.
          </div>
        ) : (
          <>
            {/* Core Stats */}
            <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Progress</h3>
              {[
                { label: 'Level', value: <span className="text-white font-bold bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-lg">Level {gamification.currentLevel}</span> },
                { label: 'Title', value: <span className="text-white font-medium">{gamification.currentTitle || 'Beginner'}</span> },
                { label: 'Total XP', value: <span className="text-emerald-400 font-mono font-bold">{(gamification.totalXp || 0).toLocaleString()} XP</span> },
                { label: 'Daily XP Today', value: <span className="text-white font-medium">{gamification.dailyXpEarned ?? 0} <span className="text-zinc-500 text-xs">/ cap</span></span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-zinc-800/60 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-[#A1A1AA] text-sm">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            {/* Streaks */}
            <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 p-5 space-y-3 shadow-sm">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-orange-400">🔥</span> Streak Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Current Streak</p>
                  <p className="text-lg text-white font-bold">{gamification.currentStreak ?? 0} <span className="text-sm font-normal text-zinc-400">days</span></p>
                </div>
                <div className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Longest Streak</p>
                  <p className="text-lg text-white font-bold">{gamification.longestStreak ?? 0} <span className="text-sm font-normal text-zinc-400">days</span></p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 pt-1 border-t border-zinc-800/60">
                Last streak activity: {gamification.lastStreakDate
                  ? new Date(gamification.lastStreakDate).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </>
        )}

        {/* Badges Earned */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" /> Badges Earned
            <span className="ml-auto text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{badges.length}</span>
          </h3>
          {badges.length === 0 ? (
            <p className="text-sm text-zinc-500 px-2">No badges earned yet.</p>
          ) : (
            <div className="space-y-2">
              {badges.map((b: any, idx: number) => (
                <div key={idx} className="bg-[#18181B] p-3 rounded-xl border border-zinc-800/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    {b.iconUrl ? <img src={b.iconUrl} alt="icon" className="w-full h-full object-cover" /> : '🏆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.name}</p>
                    <p className="text-xs text-zinc-500">{new Date(b.earnedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Badges Tab ───────────────────────────────────────────────────────────────
const BADGE_CATEGORIES = ['TASK', 'STREAK', 'BUDDY', 'ROOM'];
const BADGE_CONDITION_TYPES = [
  'HIGH_TASK_COUNT',
  'MEDIUM_TASK_COUNT',
  'LOW_TASK_COUNT',
  'STREAK_DAYS',
  'BUDDY_MATCHES',
  'ROOMS_ATTENDED'
];

const DEFAULT_FORM = {
  key: '',
  name: '',
  description: '',
  iconUrl: '',
  category: 'TASK',
  conditionType: 'HIGH_TASK_COUNT',
  conditionValue: 1,
  xpReward: 50,
  premiumRequired: false,
  isActive: true
};

const BadgesTab = ({ data, isLoading, onToggleBadge, isToggling }: any) => {
  const createBadgeMutation = useCreateBadge();
  const updateBadgeMutation = useUpdateBadge();
  const deleteBadgeMutation = useDeleteBadge();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-zinc-800/40 rounded-xl animate-pulse" />)}
    </div>
  );

  const handleOpenAdd = () => {
    setFormData(DEFAULT_FORM);
    setSelectedIconFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (badge: any) => {
    setSelectedBadge(badge);
    setFormData({
      key: badge.key || '',
      name: badge.name || '',
      description: badge.description || '',
      iconUrl: badge.iconUrl || '',
      category: badge.category || 'TASK',
      conditionType: badge.conditionType || 'HIGH_TASK_COUNT',
      conditionValue: badge.conditionValue || 1,
      xpReward: badge.xpReward ?? 50,
      premiumRequired: !!badge.premiumRequired,
      isActive: badge.isActive !== false
    });
    setSelectedIconFile(null);
    setIsEditModalOpen(true);
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Badge name is required');
    if (!formData.key.trim()) return toast.error('Badge key is required');

    const keyRegex = /^[A-Z0-9_]+$/;
    if (!keyRegex.test(formData.key)) {
      return toast.error('Badge key must be uppercase alphanumeric characters and underscores only (e.g. TASK_WARRIOR)');
    }

    try {
      setSubmitting(true);

      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        body.append(k, String(v));
      });
      if (selectedIconFile) {
        body.append('icon', selectedIconFile);
      }

      await createBadgeMutation.mutateAsync(body);
      toast.success('Badge created successfully');
      setIsAddModalOpen(false);
      setSelectedIconFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create badge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadge) return;
    if (!formData.name.trim()) return toast.error('Badge name is required');
    if (!formData.key.trim()) return toast.error('Badge key is required');

    const keyRegex = /^[A-Z0-9_]+$/;
    if (!keyRegex.test(formData.key)) {
      return toast.error('Badge key must be uppercase alphanumeric characters and underscores only (e.g. TASK_WARRIOR)');
    }

    try {
      setSubmitting(true);

      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        body.append(k, String(v));
      });
      if (selectedIconFile) {
        body.append('icon', selectedIconFile);
      }

      await updateBadgeMutation.mutateAsync({
        badgeId: selectedBadge.id || selectedBadge._id,
        badgeData: body
      });
      toast.success('Badge updated successfully');
      setIsEditModalOpen(false);
      setSelectedBadge(null);
      setSelectedIconFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update badge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!window.confirm('Are you sure you want to delete this badge definition permanently?')) return;
    try {
      await deleteBadgeMutation.mutateAsync(badgeId);
      toast.success('Badge deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete badge');
    }
  };

  return (
    <div className="space-y-8">
      {/* Section A: Badge Definitions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Badge Definitions</h2>
            <p className="text-xs text-zinc-400">Manage platform badge availability. Criteria logic is enforced server-side.</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">Add New Badge</span>
          </button>
        </div>

        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg">
          {!data?.badges?.length ? (
            <div className="p-12 text-center">
              <Trophy size={28} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No badge definitions found. Add badges in the database.</p>
            </div>
          ) : (
            <>
              {/* ── Mobile card list (hidden sm+) ── */}
              <div className="sm:hidden divide-y divide-zinc-800/60">
                {data.badges.map((badge: any) => (
                  <div key={badge.id} className="p-4 space-y-3">
                    {/* Top row: icon + name + status */}
                    <div className="flex items-start gap-3">
                      <div className="text-2xl shrink-0">
                        {badge.iconUrl ? <img src={badge.iconUrl} alt="icon" className="w-8 h-8 rounded" /> : '🏆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{badge.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono bg-zinc-800/50 inline-block px-1.5 py-0.5 rounded mt-0.5">{badge.key}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                        badge.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {badge.isActive ? 'Active' : 'Off'}
                      </span>
                    </div>
                    {/* Description */}
                    {badge.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed">{badge.description}</p>
                    )}
                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{badge.xpReward} XP</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        badge.premiumRequired
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                      }`}>
                        {badge.premiumRequired ? 'Premium' : 'All users'}
                      </span>
                      <span className="text-xs text-zinc-500 ml-auto">{(badge.usersEarned || 0).toLocaleString()} earned</span>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onToggleBadge(badge.id)}
                        disabled={isToggling}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          badge.isActive
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/40'
                        }`}
                      >
                        {badge.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(badge)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-[#2563EB]/20 border border-zinc-700 rounded-lg text-zinc-300 hover:text-[#2563EB] transition-all text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-red-500/10 border border-zinc-700 rounded-lg text-zinc-300 hover:text-red-400 transition-all text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop table (hidden on mobile) ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-[#0D0D10] text-[#A1A1AA] border-b border-zinc-800/60 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-16 text-center">Icon</th>
                      <th className="px-6 py-4 font-semibold">Badge</th>
                      <th className="px-6 py-4 font-semibold">Description / Criteria</th>
                      <th className="px-6 py-4 font-semibold text-center">Reward</th>
                      <th className="px-6 py-4 font-semibold text-center">Access</th>
                      <th className="px-6 py-4 font-semibold text-center">Earned By</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-semibold w-48 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {data.badges.map((badge: any) => (
                      <tr key={badge.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 text-center text-2xl">
                          {badge.iconUrl ? <img src={badge.iconUrl} alt="icon" className="w-6 h-6 inline-block rounded" /> : '🏆'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{badge.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5 bg-zinc-800/50 inline-block px-1.5 py-0.5 rounded">{badge.key}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-300 mb-1">{badge.description}</div>
                          <div className="text-xs text-zinc-500 inline-block bg-zinc-800 px-2 py-0.5 rounded">{badge.criteriaUrl}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-semibold text-emerald-400">
                          {badge.xpReward} XP
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            badge.premiumRequired
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                          }`}>
                            {badge.premiumRequired ? 'Premium' : 'All'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-white">{(badge.usersEarned || 0).toLocaleString()}</span>
                          <span className="text-zinc-600 text-xs ml-1">users</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                            badge.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {badge.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onToggleBadge(badge.id)}
                              disabled={isToggling}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                badge.isActive
                                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                  : 'bg-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/40'
                              }`}
                            >
                              {badge.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(badge)}
                              className="p-1.5 bg-zinc-800 hover:bg-[#2563EB]/20 border border-zinc-700 hover:border-[#2563EB]/40 rounded-lg text-zinc-300 hover:text-[#2563EB] transition-all cursor-pointer"
                              title="Edit Badge"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteBadge(badge.id)}
                              className="p-1.5 bg-zinc-800 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-lg text-zinc-300 hover:text-red-400 transition-all cursor-pointer"
                              title="Delete Badge"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section B: Recent Awards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Recent Badge Awards</h2>
          <p className="text-xs text-zinc-400">Latest badges earned across the platform</p>
        </div>
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg">
          {!data?.recentAwards?.length ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No recent badge awards.</div>
          ) : (
            data.recentAwards.map((award: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-800/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">🏆</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{award.fullName}</p>
                    <p className="text-xs text-zinc-500">{award.badgeName}</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-400">{new Date(award.earnedAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Badge Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#0D0D10] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#2563EB]" size={20} />
                <h2 className="text-lg font-bold text-white">Add New Badge</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateBadge} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Badge Name</label>
                <input
                  type="text"
                  placeholder="e.g. Task Warrior"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Badge Key (Unique ID)</label>
                <input
                  type="text"
                  placeholder="e.g. TASK_WARRIOR"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
                <span className="text-[10px] text-zinc-500">Only uppercase alphanumeric and underscores. Cannot be changed later.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Brief description of what triggers this badge..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all resize-none h-20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                >
                  {BADGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Condition Type</label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                >
                  {BADGE_CONDITION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Threshold Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Badge Icon</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedIconFile ? (
                      <img src={URL.createObjectURL(selectedIconFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : formData.iconUrl ? (
                      <img src={formData.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-zinc-600">No Icon</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-medium cursor-pointer transition-all border border-zinc-800 outline-none">
                      <span>Choose Icon Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error('File size must be less than 2MB');
                              return;
                            }
                            setSelectedIconFile(file);
                          }
                        }}
                      />
                    </label>
                    {selectedIconFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedIconFile(null)}
                        className="ml-3 text-[11px] text-red-400 hover:text-red-300 font-medium underline underline-offset-2"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[9px] text-zinc-500 mt-1">JPEG, PNG, or WEBP. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.premiumRequired}
                    onChange={(e) => setFormData({ ...formData, premiumRequired: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-800 text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Premium Required</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-800 text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Is Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 font-medium rounded-xl transition-all text-sm outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-medium rounded-xl transition-all text-sm outline-none shadow-lg shadow-[#2563EB]/25 cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Badge Modal */}
      {isEditModalOpen && selectedBadge && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#0D0D10] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#2563EB]" size={20} />
                <h2 className="text-lg font-bold text-white">Edit Badge</h2>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedBadge(null);
                }}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateBadge} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Badge Name</label>
                <input
                  type="text"
                  placeholder="e.g. Task Warrior"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Badge Key (Unique ID)</label>
                <input
                  type="text"
                  placeholder="e.g. TASK_WARRIOR"
                  value={formData.key}
                  disabled
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-500 outline-none cursor-not-allowed opacity-50"
                />
                <span className="text-[10px] text-zinc-550">The unique identifier cannot be modified.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Brief description of what triggers this badge..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all resize-none h-20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                >
                  {BADGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Condition Type</label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                >
                  {BADGE_CONDITION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Threshold Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Badge Icon</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedIconFile ? (
                      <img src={URL.createObjectURL(selectedIconFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : formData.iconUrl ? (
                      <img src={formData.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-zinc-600">No Icon</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-medium cursor-pointer transition-all border border-zinc-800 outline-none">
                      <span>Choose Icon Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error('File size must be less than 2MB');
                              return;
                            }
                            setSelectedIconFile(file);
                          }
                        }}
                      />
                    </label>
                    {selectedIconFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedIconFile(null)}
                        className="ml-3 text-[11px] text-red-400 hover:text-red-300 font-medium underline underline-offset-2"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[9px] text-zinc-500 mt-1">JPEG, PNG, or WEBP. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.premiumRequired}
                    onChange={(e) => setFormData({ ...formData, premiumRequired: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-800 text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Premium Required</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-800 text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Is Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBadge(null);
                  }}
                  className="px-4 py-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 font-medium rounded-xl transition-all text-sm outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-medium rounded-xl transition-all text-sm outline-none shadow-lg shadow-[#2563EB]/25 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
const LeaderboardTab = ({ data, isLoading, filters, setFilters }: any) => {
  const totalPages = data?.total ? Math.ceil(data.total / filters.limit) : 1;

  return (
    <div className="space-y-4">
      {/* Period note */}
      {filters.period !== 'all-time' && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <AlertCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">
            <span className="font-semibold">Note:</span> Period filtering shows all-time XP ranking. Time-scoped XP leaderboards require an XP transaction log which can be added as a future enhancement.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value, page: 1 })}
          className="bg-[#18181B] border border-zinc-800/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all-time">All Time</option>
          <option value="this-month">This Month</option>
          <option value="this-week">This Week</option>
        </select>

        <select
          value={filters.plan} onChange={e => setFilters({ ...filters, plan: e.target.value, page: 1 })}
          className="bg-[#18181B] border border-zinc-800/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all">All Plans</option>
          <option value="free">Free Users</option>
          <option value="premium">Premium Users</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.rankings?.length ? (
          <div className="p-14 text-center">
            <Star size={28} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No leaderboard data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-[#0D0D10] text-[#A1A1AA] border-b border-zinc-800/60 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">Rank</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Level & Title</th>
                  <th className="px-6 py-4 font-semibold text-right">Total XP</th>
                  <th className="px-6 py-4 font-semibold text-center">Streak</th>
                  <th className="px-6 py-4 font-semibold text-right">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.rankings.map((user: any, idx: number) => {
                  const actualRank = (filters.page - 1) * filters.limit + idx + 1;
                  const rankDisplay = actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : actualRank === 3 ? '🥉' : `#${actualRank}`;
                  return (
                    <tr key={user.userId} className={`hover:bg-zinc-800/30 transition-colors ${actualRank <= 3 ? 'bg-gradient-to-r from-amber-500/3 to-transparent' : ''}`}>
                      <td className="px-6 py-4 text-center font-black text-white text-lg">{rankDisplay}</td>
                      <td className="px-6 py-4 font-medium text-white">{user.fullName}</td>
                      <td className="px-6 py-4">
                        <span className="text-[#2563EB] font-bold mr-2">Lvl {user.currentLevel}</span>
                        <span className="text-zinc-400">{user.currentTitle || 'Beginner'}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-emerald-400">
                        {(user.totalXp || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-orange-400 font-medium">
                        {user.currentStreak > 0 ? `🔥 ${user.currentStreak}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.isPremium ? (
                          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-semibold border border-indigo-500/20 inline-flex items-center gap-1">
                            <Crown size={10} />PREMIUM
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-md">FREE</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
        <span>
          {data?.total > 0 && (
            <>
              <span className="text-white font-medium">{data.total}</span> users ranked
            </>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="p-1.5 bg-[#18181B] border border-zinc-800 disabled:opacity-40 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-zinc-400 px-1">Page {filters.page} of {totalPages}</span>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="p-1.5 bg-[#18181B] border border-zinc-800 disabled:opacity-40 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
