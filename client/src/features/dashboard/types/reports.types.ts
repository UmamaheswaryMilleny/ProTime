// ─── Productivity Report Types ───────────────────────────────────────────────
// Mirrors the server-side ProductivityReportDTO

export interface ProductivitySummary {
  totalXp:              number;
  currentStreak:        number;
  longestStreak:        number;
  currentLevel:         number;
  currentTitle:         string;
  tasksCompleted:       number;
  tasksWithPomodoro:    number;
  tasksWithoutPomodoro: number;
  totalFocusMinutes:    number;
}

export interface XpTrendPoint {
  date: string;
  xp:   number;
}

export interface TaskPriorityPoint {
  name:         string;
  pomodoro:     number;
  nonPomodoro:  number;
}

export interface HeatmapPoint {
  date:  string;
  value: number;
}

export interface ReportTask {
  id:           string;
  name:         string;
  priority:     'Low' | 'Medium' | 'High';
  completed:    boolean;
  pomodoroUsed: boolean;
  xpEarned:     number;
  status:       'Completed' | 'Expired';
  date:         string;
}

export interface ReportBadge {
  id:       string;
  name:     string;
  icon:     string;
  unlocked: boolean;
  earnedAt?: string;
}

export interface ProductivityReportData {
  summary:        ProductivitySummary;
  xpTrend:        XpTrendPoint[];
  taskByPriority: TaskPriorityPoint[];
  heatmap:        HeatmapPoint[];
  tasks:          ReportTask[];
  badges:         ReportBadge[];
}
