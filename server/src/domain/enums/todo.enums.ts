
export enum TodoPriority{
    LOW='LOW',
    MEDIUM='MEDIUM',
    HIGH='HIGH'
}

export enum TodoStatus{
    PENDING="PENDING",
    COMPLETED='COMPLETED'
}

export const ESTIMATED_TIME_OPTIONS: Record<TodoPriority, number[]> = {
  [TodoPriority.LOW]: [10, 15, 20],
  [TodoPriority.MEDIUM]: [25, 30, 35, 40, 45],
  [TodoPriority.HIGH]: [60, 90, 120, 180],
};

export const BASE_XP: Record<TodoPriority, number> = {
  [TodoPriority.LOW]: 2,
  [TodoPriority.MEDIUM]: 3,
  [TodoPriority.HIGH]: 5,
};

export const POMODORO_BONUS_XP: Record<TodoPriority, number> = {
  [TodoPriority.LOW]: 2,
  [TodoPriority.MEDIUM]: 3,
  [TodoPriority.HIGH]: 5,
};

export const POMODORO_MIN_FOR_BONUS:Record<TodoPriority,number>={
    [TodoPriority.LOW]:10,
    [TodoPriority.MEDIUM]:25,
    [TodoPriority.HIGH]:60
}

export const DAILY_XP_CAP = 50

export const BREAK_TIME={
    MIN_MINUTES:5,
    MAX_MINUTES:15,
} as const;