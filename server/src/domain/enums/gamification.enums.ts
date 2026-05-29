// Free users can see titles but levels 7+ are shown as locked
export enum LevelTitle {
  EARLY_BIRD = 'Early Bird',
  LEVEL_1 = 'Beginner - Starting Point',
  LEVEL_2 = 'Beginner - Getting Started',
  LEVEL_3 = 'Beginner - First Steps',
  LEVEL_4 = 'Learner - Curious Mind',
  LEVEL_5 = 'Learner - Knowledge Seeker',
  LEVEL_6 = 'Learner - Quick Study',
  LEVEL_7 = 'Explorer - Path Finder',
  LEVEL_8 = 'Explorer - Adventurer',
  LEVEL_9 = 'Explorer - Trail Blazer',
  LEVEL_10 = 'Achiever - Goal Crusher',
  LEVEL_11 = 'Achiever - Consistent Performer',
  LEVEL_12 = 'Achiever - Momentum Builder',
  LEVEL_13 = 'Expert - Skilled Worker',
  LEVEL_14 = 'Expert - Deep Thinker',
  LEVEL_15 = 'Expert - Precision Master',
  LEVEL_16 = 'Prodigy - Elite Focus',
  LEVEL_17 = 'Prodigy - Peak Performer',
  LEVEL_18 = 'Prodigy - Limit Breaker',
  LEVEL_19 = 'Master - Focus Legend',
  LEVEL_20 = 'Master - Time Master',
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
  switch (level) {
    case 0: return LevelTitle.EARLY_BIRD;
    case 1: return LevelTitle.LEVEL_1;
    case 2: return LevelTitle.LEVEL_2;
    case 3: return LevelTitle.LEVEL_3;
    case 4: return LevelTitle.LEVEL_4;
    case 5: return LevelTitle.LEVEL_5;
    case 6: return LevelTitle.LEVEL_6;
    case 7: return LevelTitle.LEVEL_7;
    case 8: return LevelTitle.LEVEL_8;
    case 9: return LevelTitle.LEVEL_9;
    case 10: return LevelTitle.LEVEL_10;
    case 11: return LevelTitle.LEVEL_11;
    case 12: return LevelTitle.LEVEL_12;
    case 13: return LevelTitle.LEVEL_13;
    case 14: return LevelTitle.LEVEL_14;
    case 15: return LevelTitle.LEVEL_15;
    case 16: return LevelTitle.LEVEL_16;
    case 17: return LevelTitle.LEVEL_17;
    case 18: return LevelTitle.LEVEL_18;
    case 19: return LevelTitle.LEVEL_19;
    case 20: return LevelTitle.LEVEL_20;
    default: return LevelTitle.EARLY_BIRD;
  }
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
