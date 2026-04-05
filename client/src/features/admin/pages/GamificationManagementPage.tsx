import React, { useState } from 'react';
import {
  useGamificationOverview,
  useGamificationUsers,
  useGamificationLeaderboard,
  useGamificationBadges,
  useToggleBadgeStatus,
  useGamificationUserDetail
} from '../api/useAdminGamification';
import {
  Gamepad2, Users, Trophy, BarChart3, Star, Zap, Search, Calendar, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const GamificationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'badges' | 'leaderboard'>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Users Filters
  const [userFilters, setUserFilters] = useState({ page: 1, limit: 10, search: '', level: '', title: '', sortBy: 'xp' });
  const [searchInput, setSearchInput] = useState('');

  // Leaderboard Filters
  const [leaderboardFilters, setLeaderboardFilters] = useState({ page: 1, limit: 10, period: 'all-time', plan: 'all' });

  // Data fetching
  const { data: overview, isLoading: overviewLoading } = useGamificationOverview();
  const { data: usersData, isLoading: usersLoading } = useGamificationUsers(userFilters);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useGamificationLeaderboard(leaderboardFilters);
  // const { data: badgesData, isLoading: badgesLoading } = useGamificationBadges();
  const toggleBadge = useToggleBadgeStatus();

  const handleToggleBadge = (badgeId: string) => {
    toggleBadge.mutate(badgeId, {
      onSuccess: () => toast.success('Badge status updated'),
      onError: () => toast.error('Failed to update badge'),
    });
  };

  const handleSearchUsers = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Gamepad2 className="text-[#2563EB]" /> Gamification Management
        </h1>
        <p className="text-[#A1A1AA] text-sm">
          Overview of user XP, levels, badges, and streaks across the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-800 pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users Progress', icon: Users },
          // { id: 'badges', label: 'Badges', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all ${activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-zinc-700'
              }`}
          >
            <tab.icon size={16} />
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
            handleSearch={handleSearchUsers}
            onRowClick={(userId: string) => setSelectedUserId(userId)}
          />
        )}

        {/* {activeTab === 'badges' && (
          <BadgesTab 
            data={badgesData} 
            isLoading={badgesLoading} 
            onToggleBadge={handleToggleBadge}
          />
        )} */}

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
              className="fixed top-0 right-0 bottom-0 w-[450px] bg-[#0D0D10] border-l border-zinc-800 z-50 overflow-y-auto flex flex-col shadow-2xl"
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
  if (isLoading) return <div className="text-[#A1A1AA] p-8 text-center animate-pulse">Loading overview stats...</div>;
  if (!data) return null;

  // Maximum value for bar chart scaling
  const maxLevelCount = Math.max(...(data.levelDistribution.map((d: any) => d.count) || [0]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total XP Earned" value={data.totalXpEarned.toLocaleString()} subtext="platform total" icon={Zap} />
        <SummaryCard title="Avg XP Per User" value={data.avgXpPerUser.toLocaleString()} subtext="" icon={Users} />
        <SummaryCard title="Badges Awarded" value={data.totalBadgesAwarded.toLocaleString()} subtext="all time" icon={Trophy} />
        <SummaryCard title="Active Streaks" value={data.activeStreaksCount.toLocaleString()} subtext="streak > 0" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution Bar Chart Custom Component */}
        <div className="bg-[#18181B] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-6">Level Distribution</h3>
          <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2">
            {data.levelDistribution.map((dist: any) => (
              <div key={dist.level} className="flex-1 flex flex-col justify-end items-center group relative min-w-[30px]">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 text-white">
                  Level {dist.level}: {dist.count} users
                </div>
                {/* Bar */}
                <div
                  className="w-full bg-[#2563EB] rounded-t-sm transition-all duration-500 ease-out hover:brightness-125"
                  style={{ height: `${(dist.count / maxLevelCount) * 100}%`, minHeight: dist.count > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-zinc-500 mt-2">L{dist.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Badges Custom Donut-style/List Presentation */}
        <div className="bg-[#18181B] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-6">Top Badges Awarded</h3>
          <div className="space-y-4">
            {data.topBadges.map((badge: any, idx: number) => {
              const maxCount = data.topBadges[0]?.count || 1;
              const pct = (badge.count / maxCount) * 100;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-[#A1A1AA]">
                    <span className="text-white">{badge.badgeName}</span>
                    <span>{badge.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon }: any) => (
  <div className="bg-[#18181B] p-5 rounded-2xl border border-zinc-800/60 flex items-start justify-between shadow-sm hover:border-zinc-700 transition-colors">
    <div className="space-y-1">
      <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-[11px] text-zinc-500">{subtext}</p>}
    </div>
    <div className="p-3 rounded-xl bg-zinc-800/50 text-zinc-400">
      <Icon size={20} />
    </div>
  </div>
);

const UsersTab = ({ data, isLoading, filters, setFilters, searchInput, setSearchInput, handleSearch, onRowClick }: any) => {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-[#18181B] border border-zinc-800/60 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </form>
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
          <option value="xp">Sort: XP High-Low</option>
          <option value="streak">Sort: Streak High-Low</option>
          <option value="badges">Sort: Badges High-Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 animate-pulse">Loading users...</div>
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
                {data?.users.map((user: any) => (
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
                      {user.totalXp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.currentStreak > 0 ? (
                        <span className="text-orange-400 font-medium">🔥 {user.currentStreak} days</span>
                      ) : (
                        <span className="text-zinc-600">0 days</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-zinc-800/50 text-white px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-700/50">
                        {user.badgeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      {new Date(user.lastActiveAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
        <span>Showing {data?.users.length || 0} of {data?.total || 0} users</span>
        <div className="flex gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="p-1 px-3 bg-[#18181B] border border-zinc-800 disabled:opacity-50 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Prev
          </button>
          <button
            disabled={!data || data.users.length < filters.limit}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="p-1 px-3 bg-[#18181B] border border-zinc-800 disabled:opacity-50 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Side Panel Content ───────────────────────────────────────────────────────
const UserDetailPanel = ({ userId, onClose }: { userId: string, onClose: () => void }) => {
  const { data, isLoading } = useGamificationUserDetail(userId);

  if (isLoading) {
    return <div className="p-8 text-[#A1A1AA] animate-pulse">Loading user details...</div>;
  }

  if (!data) {
    return <div className="p-8 text-red-400">Failed to load data.</div>;
  }

  const { user, gamification, badges } = data;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-[#121215]">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{user.fullName}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isPremium ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
            {user.isPremium ? 'Premium' : 'Free User'}
          </span>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800 transition">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Core Stats Box */}
        <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
            <span className="text-[#A1A1AA] text-sm">Level</span>
            <span className="text-white font-bold bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-lg">Level {gamification.currentLevel}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
            <span className="text-[#A1A1AA] text-sm">Title</span>
            <span className="text-white font-medium">{gamification.currentTitle || 'Beginner'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
            <span className="text-[#A1A1AA] text-sm">Total XP</span>
            <span className="text-emerald-400 font-mono font-bold">{gamification.totalXp.toLocaleString()} XP</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-[#A1A1AA] text-sm">Daily XP Today</span>
            <div className="text-right">
              <span className="text-white font-medium">{gamification.dailyXpEarned}</span>
              <span className="text-zinc-500 text-xs ml-1">/ cap</span>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-[#18181B] rounded-2xl border border-zinc-800/60 p-5 space-y-4 shadow-sm">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
            <span className="text-orange-400">🔥</span> Streak Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Current Streak</p>
              <p className="text-lg text-white font-bold">{gamification.currentStreak} Days</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Longest Streak</p>
              <p className="text-lg text-white font-bold">{gamification.longestStreak} Days</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800/60">
            Last active streak: {gamification.lastStreakDate ? new Date(gamification.lastStreakDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        {/* Badges Earned */}
        <div>
          <h3 className="text-white font-semibold mb-4 px-1">Badges Earned ({badges.length})</h3>
          <div className="space-y-3">
            {badges.map((b: any, idx: number) => (
              <div key={idx} className="bg-[#18181B] p-3 rounded-xl border border-zinc-800/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xl overflow-hidden relative">
                  {b.iconUrl ? <img src={b.iconUrl} alt="icon" className="w-full h-full object-cover" /> : '🏆'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{b.name}</p>
                  <p className="text-xs text-zinc-500">{new Date(b.earnedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {badges.length === 0 && <p className="text-sm text-zinc-500 px-2">No badges earned yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Badges Tab ───────────────────────────────────────────────────────────────
const BadgesTab = ({ data, isLoading, onToggleBadge }: any) => {
  if (isLoading) return <div className="p-8 text-[#A1A1AA] animate-pulse">Loading badge data...</div>;

  return (
    <div className="space-y-8">
      {/* Section A: Definitions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Badge Definitions</h2>
          <p className="text-xs text-zinc-400">Manage platform badge availability. Criteria logic is hardcoded globally.</p>
        </div>

        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-[#0D0D10] text-[#A1A1AA] border-b border-zinc-800/60 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">Icon</th>
                  <th className="px-6 py-4 font-semibold">Badge</th>
                  <th className="px-6 py-4 font-semibold">Criteria/Desc</th>
                  <th className="px-6 py-4 font-semibold text-center">Earned</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data?.badges.map((badge: any) => (
                  <tr key={badge.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-center text-2xl">
                      {badge.iconUrl ? <img src={badge.iconUrl} alt="icon" className="w-6 h-6 inline-block" /> : '🏆'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{badge.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{badge.key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">{badge.description}</div>
                      <div className="text-xs text-zinc-500 mt-1 inline-block bg-zinc-800 px-2 py-0.5 rounded">{badge.criteriaUrl}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {badge.usersEarned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${badge.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {badge.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleBadge(badge.id)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${badge.isActive
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                            : 'bg-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/40'
                          }`}
                      >
                        {badge.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section B: Recent */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Recent Badge Awards</h2>
          <p className="text-xs text-zinc-400">Latest badges earned across the platform</p>
        </div>
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg p-1">
          {data?.recentAwards.map((award: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-800/30 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">🏆</div>
                <div>
                  <p className="text-sm font-medium text-white">{award.fullName}</p>
                  <p className="text-xs text-zinc-500">{award.badgeName}</p>
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                {new Date(award.earnedAt).toLocaleString()}
              </div>
            </div>
          ))}
          {data?.recentAwards.length === 0 && <div className="p-6 text-center text-zinc-500">No recent awards.</div>}
        </div>
      </div>
    </div>
  );
};

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
const LeaderboardTab = ({ data, isLoading, filters, setFilters }: any) => {
  return (
    <div className="space-y-4">
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
          <div className="p-8 text-center text-zinc-500 animate-pulse">Loading rankings...</div>
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
                {data?.rankings.map((user: any, idx: number) => {
                  const actualRank = (filters.page - 1) * filters.limit + idx + 1;
                  return (
                    <tr key={user.userId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-center font-black text-white text-lg">
                        {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : actualRank === 3 ? '🥉' : actualRank}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{user.fullName}</td>
                      <td className="px-6 py-4">
                        <span className="text-[#2563EB] font-bold mr-2">Lvl {user.currentLevel}</span>
                        <span className="text-zinc-400">{user.currentTitle || 'Beginner'}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-emerald-400">
                        {user.totalXp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-orange-400 font-medium">
                        {user.currentStreak > 0 ? `🔥 ${user.currentStreak}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.isPremium ? (
                          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-semibold border border-indigo-500/20">PREMIUM</span>
                        ) : (
                          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-md">FREE</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
        <span>Showing {data?.rankings.length || 0} top users</span>
        <div className="flex gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="p-1 px-3 bg-[#18181B] border border-zinc-800 disabled:opacity-50 rounded-lg"
          >
            Prev
          </button>
          <button
            disabled={!data || data.rankings.length < filters.limit}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="p-1 px-3 bg-[#18181B] border border-zinc-800 disabled:opacity-50 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
