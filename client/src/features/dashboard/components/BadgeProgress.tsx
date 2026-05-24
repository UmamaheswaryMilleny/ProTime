import React, { useRef, useState } from 'react';
import { Lock, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { useGamification } from '../../gamification/hooks/useGamification';

interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'task' | 'streak' | 'buddy' | 'room';
}

const ALL_BADGES: BadgeDef[] = [
  { key: 'HIGH_ACHIEVER',     name: 'High Achiever',     description: 'Complete 1 High-Priority task',                              icon: '🍃', category: 'task'   },
  { key: 'MEDIUM_MASTER',    name: 'Medium Master',     description: 'Complete 1 Medium-Priority task',                            icon: '💪', category: 'task'   },
  { key: 'STEADY_STARTER',   name: 'Steady Starter',    description: 'Complete 1 Low-Priority task',                               icon: '🌱', category: 'task'   },
  { key: 'FOCUS_BUILDER',    name: 'Focus Builder',     description: 'Complete a 7-day streak',                                    icon: '⭐', category: 'streak' },
  { key: 'CONSISTENCY_CHAMP',name: 'Consistency Champ', description: 'Complete a 10-day streak',                                   icon: '❤️', category: 'streak' },
  { key: 'DISCIPLINE_HERO',  name: 'Discipline Hero',   description: 'Complete a 16-day streak',                                   icon: '🛡️', category: 'streak' },
  { key: 'PERSISTENCE_PRO',  name: 'Persistence Pro',   description: 'Complete a 28-day streak',                                   icon: '🏋️', category: 'streak' },
  { key: 'REAL_WARRIOR',     name: 'Real Warrior',      description: 'Complete a 52-day streak',                                   icon: '⚙️', category: 'streak' },
  { key: 'BUDDY_BEGINNER',   name: 'Buddy Beginner',    description: 'Match with 2 buddies — min 4⭐ each',                        icon: '🤝', category: 'buddy'  },
  { key: 'BUDDY_BUILDER',    name: 'Buddy Builder',     description: 'Match with 5 buddies — min 4⭐ each',                        icon: '☀️', category: 'buddy'  },
  { key: 'BUDDY_MASTER',     name: 'Buddy Master',      description: 'Match with 10 buddies — min 4⭐ each',                       icon: '🌊', category: 'buddy'  },
  { key: 'ROOM_EXPLORER',    name: 'Room Explorer',     description: 'Attend 2 group study rooms',                                 icon: '📍', category: 'room'   },
  { key: 'ROOM_REGULAR',     name: 'Room Regular',      description: 'Attend 5 group study rooms',                                 icon: '🏠', category: 'room'   },
  { key: 'ROOM_LEADER',      name: 'Room Leader',       description: 'Attend 10 group study rooms',                                icon: '🎯', category: 'room'   },
];

const CATEGORY_LABELS: Record<BadgeDef['category'], string> = {
  task: 'Task', streak: 'Streak', buddy: 'Buddy', room: 'Room',
};

const PAGE_SIZE = 4; // badges visible at a time (2 columns × 2 rows)

export const BadgeProgress: React.FC = () => {
  const { gamification, isLoading } = useGamification();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <div className="w-full bg-[#18181B] rounded-2xl border border-[#27272A] p-6 lg:p-8 animate-pulse h-72" />;
  }

  const earnedKeys = new Set((gamification?.earnedBadges || []).map((b) => b.badgeKey));
  const earnedCount = earnedKeys.size;
  const totalPages = Math.ceil(ALL_BADGES.length / PAGE_SIZE);
  const visibleBadges = ALL_BADGES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const goTo = (dir: 1 | -1) => {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, p + dir)));
  };

  return (
    <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-5 fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Badge Progress</h2>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            {earnedCount === 0
              ? 'Complete tasks to start earning badges!'
              : `${earnedCount} of ${ALL_BADGES.length} badges unlocked`}
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.USER_PROFILE, { state: { openBadges: true } })}
          className="text-sm font-semibold text-[#8A2BE2] hover:text-purple-400 transition-colors"
        >
          View Gallery
        </button>
      </div>

      {/* ── Overall progress bar ── */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
          <span>Overall Progress</span>
          <span className="text-[#8A2BE2]">{earnedCount} / {ALL_BADGES.length}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8A2BE2] to-purple-400 transition-all duration-700 rounded-full"
            style={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Badge cards ── */}
      <div ref={gridRef} className="grid grid-cols-2 gap-3">
        {visibleBadges.map((badge) => {
          const isEarned = earnedKeys.has(badge.key);
          return (
            <div
              key={badge.key}
              className={`relative rounded-xl p-3.5 border flex items-center gap-3 transition-all duration-300 group ${
                isEarned
                  ? 'bg-[#1F1F23] border-yellow-500/30 hover:border-yellow-500/60 shadow-[0_4px_20px_rgba(212,175,55,0.08)]'
                  : 'bg-[#18181B] border-zinc-800/60 opacity-60'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  isEarned
                    ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#D4AF37]/10 group-hover:scale-110'
                    : 'bg-zinc-900'
                }`}
              >
                {isEarned ? badge.icon : <Lock size={16} className="text-zinc-600" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className={`text-xs font-bold truncate ${isEarned ? 'text-white' : 'text-zinc-500'}`}>
                    {badge.name}
                  </h3>
                  <span className={`flex-shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                    isEarned
                      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-zinc-600 bg-zinc-800/60 border-zinc-700/50'
                  }`}>
                    {isEarned ? '✓' : CATEGORY_LABELS[badge.category]}
                  </span>
                </div>
                <p className={`text-[10px] line-clamp-1 ${isEarned ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {badge.description}
                </p>
                {/* Mini progress bar */}
                <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    isEarned ? 'bg-gradient-to-r from-[#FDB931] to-[#D4AF37] w-full' : 'w-0'
                  }`} />
                </div>
              </div>

              {/* Glow dot for earned */}
              {isEarned && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(212,175,55,0.9)] animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pagination controls ── */}
      <div className="flex items-center justify-between">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded-full transition-all duration-200 ${
                i === page
                  ? 'w-5 h-1.5 bg-[#8A2BE2]'
                  : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(-1)}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs text-zinc-600 font-medium px-1">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => goTo(1)}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Footer tip ── */}
      <div className="flex items-center gap-3 bg-[blueviolet]/5 rounded-xl p-3.5 border border-[blueviolet]/10">
        <div className="p-1.5 rounded-lg bg-[blueviolet]/10 text-[blueviolet] flex-shrink-0">
          <Trophy size={16} />
        </div>
        <p className="text-xs text-zinc-400">
          {earnedCount === 0
            ? 'Complete your first task to unlock your first badge.'
            : earnedCount < ALL_BADGES.length
            ? `${ALL_BADGES.length - earnedCount} badges still locked — keep completing tasks & streaks!`
            : '🏆 All badges unlocked! You\'re a ProTime legend.'}
        </p>
        {earnedCount > 0 && (
          <span className="ml-auto flex-shrink-0 text-base font-black text-yellow-400">
            {earnedCount} 🏅
          </span>
        )}
      </div>
    </div>
  );
};
