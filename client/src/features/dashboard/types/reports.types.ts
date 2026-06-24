// ─── Productivity Report Types ───────────────────────────────────────────────
// Mirrors the server-side ProductivityReportDTO

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
  completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
  completedWithBuddyName?: string | null;
  completedInRoomName?: string | null;
}

export interface ReportBadge {
  id:       string;
  name:     string;
  icon:     string;
  unlocked: boolean;
  earnedAt?: string;
  description?: string;
}

export interface ReportRoom {
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

export interface ProductivityReportData {
  summary:        ProductivitySummary;
  xpTrend:        XpTrendPoint[];
  taskByPriority: TaskPriorityPoint[];
  heatmap:        HeatmapPoint[];
  tasks:          ReportTask[];
  badges:         ReportBadge[];
  rooms?:         ReportRoom[];
}
