export type ReportRange = '7days' | '14days' | '30days' | '90days' | 'custom';

export interface CustomDateRange {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate:   string; // ISO date string YYYY-MM-DD
}

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
  name:          string;      // 'Low' | 'Medium' | 'High'
  pomodoro:    number;
  nonPomodoro: number;
}

export interface HeatmapPoint {
  date:  string;
  value: number;  // 0–4 (clamped)
}

export interface ReportTaskItem {
  id:           string;
  name:         string;
  priority:     'Low' | 'Medium' | 'High';
  completed:    boolean;
  pomodoroUsed: boolean;
  xpEarned:     number;
  status:       'Completed' | 'Expired';
  date:         string;
}

export interface ReportBadgeItem {
  id:       string;
  name:     string;
  icon:     string;
  unlocked: boolean;
  earnedAt?: string;
}

export interface ProductivityReportDTO {
  summary:        ProductivitySummary;
  xpTrend:        XpTrendPoint[];
  taskByPriority: TaskPriorityPoint[];
  heatmap:        HeatmapPoint[];
  tasks:          ReportTaskItem[];
  badges:         ReportBadgeItem[];
}


export interface IGetProductivityReportUsecase {
  execute(userId: string, range: ReportRange, month?: string): Promise<ProductivityReportDTO>;
}
