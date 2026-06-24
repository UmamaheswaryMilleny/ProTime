export type ReportRange = '7days' | '14days' | '30days' | '90days' | 'custom' | 'all';

export interface CustomDateRange {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate:   string; // ISO date string YYYY-MM-DD
}

export interface XpBreakdown {
  tasks: number;
  pomodoro: number;
  badges: number;
  streaks: number;
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
  roomsJoined:          number;
  roomsJoinedFirstHalf?: number;
  roomsJoinedSecondHalf?: number;
  xpBreakdown: XpBreakdown;
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
  completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
  completedWithBuddyName?: string | null;
  completedInRoomName?: string | null;
}

export interface ReportBadgeItem {
  id:       string;
  name:     string;
  icon:     string;
  unlocked: boolean;
  earnedAt?: string;
  description?: string;
}

export interface ReportRoomItem {
  id: string;
  name: string;
  role: 'Host' | 'Participant';
  durationMinutes: number;
  date: string;
  status: 'WAITING' | 'LIVE' | 'ENDED';
  features: string[];
  maxParticipants: number;
  currentParticipants: number;
}

export interface ProductivityReportDTO {
  summary:        ProductivitySummary;
  xpTrend:        XpTrendPoint[];
  taskByPriority: TaskPriorityPoint[];
  heatmap:        HeatmapPoint[];
  tasks:          ReportTaskItem[];
  badges:         ReportBadgeItem[];
  rooms:          ReportRoomItem[];
}


export interface IGetProductivityReportUsecase {
  execute(userId: string, range: ReportRange, month?: string): Promise<ProductivityReportDTO>;
}
