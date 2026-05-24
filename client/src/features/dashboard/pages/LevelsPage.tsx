import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGamification } from '../../gamification/hooks/useGamification';
import { ROUTES } from '../../../shared/constants/constants.routes';

interface Level {
  level: number;
  title: string;
  subtitle: string;
  xpRequired: number;
}

interface Tier {
  name: string;
  levels: Level[];
}

const tiers: Tier[] = [
  {
    name: 'Beginner Tier',
    levels: [
      { level: 0,  title: 'Early Bird', subtitle: 'New Beginnings', xpRequired: 0    },
      { level: 1,  title: 'Beginner',   subtitle: 'Starting Point', xpRequired: 100  },
      { level: 2,  title: 'Beginner',   subtitle: 'Getting Started', xpRequired: 150  },
      { level: 3,  title: 'Beginner',   subtitle: 'First Steps', xpRequired: 200  },
    ]
  },
  {
    name: 'Learner Tier',
    levels: [
      { level: 4,  title: 'Learner',    subtitle: 'Curious Mind', xpRequired: 250  },
      { level: 5,  title: 'Learner',    subtitle: 'Knowledge Seeker', xpRequired: 300  },
      { level: 6,  title: 'Learner',    subtitle: 'Quick Study', xpRequired: 350  },
    ]
  },
  {
    name: 'Explorer Tier',
    levels: [
      { level: 7,  title: 'Explorer',   subtitle: 'Path Finder', xpRequired: 400  },
      { level: 8,  title: 'Explorer',   subtitle: 'Adventurer', xpRequired: 450  },
      { level: 9,  title: 'Explorer',   subtitle: 'Trail Blazer', xpRequired: 500  },
    ]
  },
  {
    name: 'Achiever Tier',
    levels: [
      { level: 10, title: 'Achiever',   subtitle: 'Goal Crusher', xpRequired: 600  },
      { level: 11, title: 'Achiever',   subtitle: 'Consistent Performer', xpRequired: 700  },
      { level: 12, title: 'Achiever',   subtitle: 'Momentum Builder', xpRequired: 800  },
    ]
  },
  {
    name: 'Expert Tier',
    levels: [
      { level: 13, title: 'Expert',     subtitle: 'Skilled Worker', xpRequired: 900  },
      { level: 14, title: 'Expert',     subtitle: 'Deep Thinker', xpRequired: 1000 },
      { level: 15, title: 'Expert',     subtitle: 'Precision Master', xpRequired: 1150 },
    ]
  },
  {
    name: 'Prodigy Tier',
    levels: [
      { level: 16, title: 'Prodigy',    subtitle: 'Elite Focus', xpRequired: 1300 },
      { level: 17, title: 'Prodigy',    subtitle: 'Peak Performer', xpRequired: 1450 },
      { level: 18, title: 'Prodigy',    subtitle: 'Limit Breaker', xpRequired: 1600 },
    ]
  },
  {
    name: 'Master Tier',
    levels: [
      { level: 19, title: 'Master',     subtitle: 'Focus Legend', xpRequired: 1800 },
      { level: 20, title: 'Master',     subtitle: 'Time Master', xpRequired: 2000 },
    ]
  }
];

const levels: Level[] = tiers.flatMap((t) => t.levels);

function getLevelFromXp(xp: number) {
  let current = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) { current = levels[i]; break; }
  }
  const next = levels.find((l) => l.level === current.level + 1);
  const nextLevelXp = next?.xpRequired ?? current.xpRequired;
  const xpInCurrentLevel = xp - current.xpRequired;
  const xpNeededForNext = nextLevelXp - current.xpRequired;
  const progress = next ? Math.round((xpInCurrentLevel / xpNeededForNext) * 100) : 100;
  const formattedTitle = current.level === 0 ? current.title : `${current.title} - ${current.subtitle}`;
  return { currentLevel: current.level, currentTitle: formattedTitle, nextLevelXp, progress };
}

export const LevelsPage: React.FC = () => {
  const { gamification, isLoading } = useGamification();

  if (isLoading && !gamification) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A2BE2]"></div>
      </div>
    );
  }

  const currentXP = gamification?.totalXp ?? 0;
  const { currentLevel, currentTitle, nextLevelXp, progress } = getLevelFromXp(currentXP);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="space-y-4">
        <Link to={ROUTES.USER_PROFILE} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /><span>Back</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Levels</h1>
          <p className="text-zinc-400">Complete Tasks, Streaks, And Sessions To Earn XP And Level Up.</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/5">
        <div className="flex justify-between items-end mb-2">
          <span className="text-white font-bold">Current Level — {currentLevel} ({currentTitle})</span>
          <span className="text-[#8A2BE2] font-bold">{progress}%</span>
        </div>
        <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div className="absolute top-0 left-0 h-full bg-[#8A2BE2] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Level {currentLevel}</span>
          <span className="text-zinc-400">{currentXP} XP / {nextLevelXp} XP</span>
          <span>Level {currentLevel + 1 <= 20 ? currentLevel + 1 : 'MAX'}</span>
        </div>
      </div>

      {/* Levels Grouped by Tier */}
      <div className="space-y-10">
        {tiers.map((tier) => (
          <div key={tier.name} className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_rgba(138,43,226,0.8)]" />
              {tier.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tier.levels.map((item) => {
                const isActive = item.level === currentLevel;
                const isCompleted = currentXP >= item.xpRequired && item.level < currentLevel;
                return (
                  <div
                    key={item.level}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#5b2091] to-[#8A2BE2] border-[#8A2BE2] shadow-lg shadow-[#8A2BE2]/20'
                        : isCompleted
                        ? 'bg-zinc-800/50 border-green-500/30'
                        : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold ${
                          isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-zinc-400'
                        }`}
                      >
                        {item.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                          {item.title}
                        </div>
                        <div className={`text-xs truncate font-medium ${isActive ? 'text-purple-200' : 'text-zinc-400'}`}>
                          {item.subtitle}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            isActive ? 'text-blue-100' : 'text-zinc-500'
                          }`}
                        >
                          {item.level === 0 ? 'Starting point' : `${item.xpRequired} XP required`}
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-bold text-green-400 shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};