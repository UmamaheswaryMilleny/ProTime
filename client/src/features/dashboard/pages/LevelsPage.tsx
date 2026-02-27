import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { ROUTES } from '../../../config/env';

interface UserWithXp { xp?: number; }

interface Level { level: number; title: string; xpRequired: number; }

const levels: Level[] = [
  { level: 0,  title: 'Early Bird', xpRequired: 0    },
  { level: 1,  title: 'Beginner',   xpRequired: 100  },
  { level: 2,  title: 'Beginner',   xpRequired: 150  },
  { level: 3,  title: 'Beginner',   xpRequired: 200  },
  { level: 4,  title: 'Learner',    xpRequired: 250  },
  { level: 5,  title: 'Learner',    xpRequired: 300  },
  { level: 6,  title: 'Learner',    xpRequired: 350  },
  { level: 7,  title: 'Explorer',   xpRequired: 400  },
  { level: 8,  title: 'Explorer',   xpRequired: 450  },
  { level: 9,  title: 'Explorer',   xpRequired: 500  },
  { level: 10, title: 'Achiever',   xpRequired: 600  },
  { level: 11, title: 'Achiever',   xpRequired: 700  },
  { level: 12, title: 'Achiever',   xpRequired: 800  },
  { level: 13, title: 'Expert',     xpRequired: 900  },
  { level: 14, title: 'Expert',     xpRequired: 1000 },
  { level: 15, title: 'Expert',     xpRequired: 1150 },
  { level: 16, title: 'Prodigy',    xpRequired: 1300 },
  { level: 17, title: 'Prodigy',    xpRequired: 1450 },
  { level: 18, title: 'Prodigy',    xpRequired: 1600 },
  { level: 19, title: 'Master',     xpRequired: 1800 },
  { level: 20, title: 'Master',     xpRequired: 2000 },
];

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
  return { currentLevel: current.level, currentTitle: current.title, nextLevelXp, progress };
}

export const LevelsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  // ⚠️ user.xp not on auth store yet — backend needs to return XP on profile endpoint
  const currentXP: number = (user as unknown as UserWithXp)?.xp ?? 0;
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

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((item) => {
          const isActive = item.level === currentLevel;
          const isCompleted = currentXP >= item.xpRequired && item.level < currentLevel;
          return (
            <div key={item.level} className={`relative p-4 rounded-xl border transition-all ${isActive ? 'bg-gradient-to-r from-[#5b2091] to-[#8A2BE2] border-[#8A2BE2] shadow-lg shadow-[#8A2BE2]/20' : isCompleted ? 'bg-zinc-800/50 border-green-500/30' : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-zinc-400'}`}>{item.level}</div>
                <div>
                  <div className={`font-bold ${isActive ? 'text-white' : 'text-zinc-200'}`}>{item.title}</div>
                  <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-zinc-500'}`}>{item.level === 0 ? 'Starting point — no XP required' : `${item.xpRequired} XP required`}</div>
                </div>
                {isActive && <span className="ml-auto text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">Current</span>}
                {isCompleted && <span className="ml-auto text-xs font-bold text-green-400">✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};