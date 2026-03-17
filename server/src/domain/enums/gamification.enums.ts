// Free users can see titles but levels 7+ are shown as locked
export enum LevelTitle {
  EARLY_BIRD = 'Early Bird', // Level 0 — before first XP
  BEGINNER = 'Beginner', // Level 1–3
  LEARNER = 'Learner', // Level 4–6   ← free users max visible title
  EXPLORER = 'Explorer', // Level 7–9   locaked for free users
  ACHIEVER = 'Achiever', // Level 10–12 loacked for free users
  EXPERT = 'Expert', // Level 13–15      locaked for free users
  PRODIGY = 'Prodigy', // Level 16–18    locked for free users
  MASTER = 'Master', // Level 19–20      locked for free users
}


export enum BadgeCategory {
  TASK = 'TASK', // task completion based
  STREAK = 'STREAK', // streak based
  BUDDY = 'BUDDY', // buddy collaboration based
  ROOM = 'ROOM', // group room participation based
}


// Used by BadgeDefinitionEntity to describe what triggers the badge.
// Admin can set conditionType + conditionValue in the admin panel.
export enum BadgeConditionType {
  HIGH_TASK_COUNT = 'HIGH_TASK_COUNT', // complete N high priority tasks
  MEDIUM_TASK_COUNT = 'MEDIUM_TASK_COUNT', // complete N medium priority tasks
  LOW_TASK_COUNT = 'LOW_TASK_COUNT', // complete N low priority tasks
  STREAK_DAYS = 'STREAK_DAYS', // maintain streak for N days
  BUDDY_MATCHES = 'BUDDY_MATCHES', // match with N buddies (min 4★, min 1hr)
  ROOMS_ATTENDED = 'ROOMS_ATTENDED', // attend N rooms (min 1hr each)

}


// Total XP required to REACH each level.
// Level 0 = 0 XP (starting state, title: Early Bird)
// Array index = level number
export const LEVEL_XP_THRESHOLDS: number[] = [
  0, // Level 0  — Early Bird
  100, // Level 1  — Beginner
  150, // Level 2
  200, // Level 3
  250, // Level 4  — Learner
  300, // Level 5
  350, // Level 6
  400, // Level 7  — Explorer (locked for free)
  450, // Level 8
  500, // Level 9
  600, // Level 10 — Achiever (locked for free)
  700, // Level 11
  800, // Level 12
  900, // Level 13 — Expert (locked for free)
  1000, // Level 14
  1150, // Level 15
  1300, // Level 16 — Prodigy (locked for free)
  1450, // Level 17
  1600, // Level 18
  1800, // Level 19 — Master (locked for free)
  2000, // Level 20
];

export const MAX_LEVEL = 20;


// Used by gamification usecase after every XP award.
export function getTitleForLevel(level: number): LevelTitle {
  if (level === 0) return LevelTitle.EARLY_BIRD;
  if (level >= 1 && level <= 3) return LevelTitle.BEGINNER;
  if (level >= 4 && level <= 6) return LevelTitle.LEARNER;
  if (level >= 7 && level <= 9) return LevelTitle.EXPLORER;
  if (level >= 10 && level <= 12) return LevelTitle.ACHIEVER;
  if (level >= 13 && level <= 15) return LevelTitle.EXPERT;
  if (level >= 16 && level <= 18) return LevelTitle.PRODIGY;
  return LevelTitle.MASTER; // level 19–20
}


// Derive current level from total XP accumulated.
// every time a user earns XP you need to know if they leveled up. 
// Iterates thresholds from highest to lowest — returns first level user has reached.
export function getLevelFromXp(totalXp: number): number {
  for (let level = MAX_LEVEL; level >= 0; level--) {
    if (totalXp >= LEVEL_XP_THRESHOLDS[level]!) return level;
  }
  return 0;
}

// Awarded when streak reaches a milestone.
// Key = streak day milestone, Value = bonus XP awarded once at that milestone.
export const STREAK_BONUS_XP_FREE: Record<number, number> = {
  1: 5,
  3: 10,
  5: 15,
  7: 20,
  10: 25,
  15: 30,
  20: 35,
  30: 40,
  50: 45,
  75: 50,
  100: 100,
};

export const STREAK_BONUS_XP_PREMIUM: Record<number, number> = {
  1: 10,
  3: 20,
  5: 30,
  7: 40,
  10: 50,
  15: 60,
  20: 70,
  30: 80,
  50: 95,
  75: 100,
  100: 200,
};

// Premium-only badges: bonus only awarded if user is PREMIUM at time of earning.
export const BADGE_XP_BONUS = 50;


export type XpSource =
  | 'TODO_LOW'
  | 'TODO_MEDIUM'
  | 'TODO_HIGH'
  | 'STREAK_BONUS'
  | 'BADGE_BONUS';

export const FREE_MAX_LEVEL = 6; // LEARNER = levels 4-6, above this = locked for free


//  Free Title Lock
// Free users can see all levels but titles above LEARNER are locked (visual only).
// The actual title is still computed — just displayed as locked in the frontend.
// export const FREE_MAX_VISIBLE_TITLE = LevelTitle.LEARNER; // Level 6
