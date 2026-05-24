import { inject, injectable } from 'tsyringe';

import type { ITodoRepository }           from '../../../../domain/repositories/todo/todo.repository.interface';
import type { IGamificationRepository }   from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IUserBadgeRepository }       from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IBadgeDefinitionRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IStudyRoomRepository }      from '../../../../domain/repositories/study-room/study-room.repository.interface';

import { TodoStatus, TodoPriority }  from '../../../../domain/enums/todo.enums';
import type {
  IGetProductivityReportUsecase,
  ProductivityReportDTO,
  ReportRange,
  XpTrendPoint,
  TaskPriorityPoint,
  HeatmapPoint,
  ReportTaskItem,
  ReportBadgeItem,
} from '../../interface/todo/get-productivity-report.usecase.interface';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a Date to midnight UTC string YYYY-MM-DD */
const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

/** Format a date string as short weekday label "Mon 14" */
const toLabel = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
};

/** Capitalise first letter */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ─── Usecase ──────────────────────────────────────────────────────────────────

@injectable()
export class GetProductivityReportUsecase implements IGetProductivityReportUsecase {
  constructor(
    @inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,

    @inject('IGamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,

    @inject('IUserBadgeRepository')
    private readonly userBadgeRepository: IUserBadgeRepository,

    @inject('IBadgeDefinitionRepository')
    private readonly badgeDefinitionRepository: IBadgeDefinitionRepository,

    @inject('IStudyRoomRepository')
    private readonly studyRoomRepository: IStudyRoomRepository,
  ) {}

  async execute(userId: string, range: ReportRange, month?: string): Promise<ProductivityReportDTO> {
    const allTodos = await this.todoRepository.findByUserId(userId, 'all');

    let since: Date;
    let until: Date;
    let dayKeys: string[] = [];
    const isCalendarMonth = month && /^\d{4}-\d{2}$/.test(month);
    const isMonthRange = month && /^\d{4}-\d{2}_\d{4}-\d{2}$/.test(month);

    if (isMonthRange) {
      const parts = month!.split('_');
      const startStr = parts[0] || '';
      const endStr = parts[1] || '';
      const startParts = startStr.split('-').map(Number);
      const endParts = endStr.split('-').map(Number);

      const startYear = startParts[0] || 2026;
      const startMonthVal = startParts[1] || 1;
      const endYear = endParts[0] || 2026;
      const endMonthVal = endParts[1] || 12;

      since = new Date(Date.UTC(startYear, startMonthVal - 1, 1, 0, 0, 0, 0));
      until = new Date(Date.UTC(endYear, endMonthVal, 0, 23, 59, 59, 999));

      const temp = new Date(since);
      while (temp <= until) {
        dayKeys.push(toDateKey(temp));
        temp.setUTCDate(temp.getUTCDate() + 1);
      }
    } else if (isCalendarMonth) {
      const parts = month!.split('-');
      const year = Number(parts[0]);
      const monthIndex = Number(parts[1]) - 1;
      since = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
      until = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

      const totalDays = until.getUTCDate();
      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(Date.UTC(year, monthIndex, d));
        dayKeys.push(toDateKey(date));
      }
    } else if (range === 'all') {
      let earliestDate = new Date();
      if (allTodos.length > 0) {
        allTodos.forEach(t => {
          const d = new Date(t.completedAt ?? t.updatedAt ?? t.createdAt);
          if (d < earliestDate) earliestDate = d;
        });
      } else {
        earliestDate = new Date(Date.now() - 30 * 86_400_000);
      }
      since = new Date(earliestDate);
      since.setUTCHours(0, 0, 0, 0);
      until = new Date();

      const temp = new Date(since);
      while (temp <= until) {
        dayKeys.push(toDateKey(temp));
        temp.setUTCDate(temp.getUTCDate() + 1);
      }
    } else {
      let days = 7;
      if (range === '14days') days = 14;
      else if (range === '30days') days = 30;
      else if (range === '90days') days = 90;

      const nowMs = Date.now();
      since = new Date(nowMs - days * 86_400_000);
      since.setUTCHours(0, 0, 0, 0);
      until = new Date(nowMs);

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(nowMs - i * 86_400_000);
        d.setUTCHours(0, 0, 0, 0);
        dayKeys.push(toDateKey(d));
      }
    }

    // ── 1. Fetch raw data in parallel ─────────────────────────────────────────
    const [gamification, userBadges, allBadgeDefs, roomsJoined] = await Promise.all([
      this.gamificationRepository.findByUserId(userId),
      this.userBadgeRepository.findAllByUserId(userId),
      this.badgeDefinitionRepository.findAllActive(),
      this.studyRoomRepository.countJoinedOrHostedInMonth(userId, since, until),
    ]);

    // ── 2. Filter todos to date range ──────────────────────────────────────────
    // Use completedAt for completed tasks, createdAt for expired tasks
    const rangedTodos = allTodos.filter(t => {
      const ref = t.completedAt ?? t.updatedAt ?? t.createdAt;
      const refDate = new Date(ref);
      return (isCalendarMonth || isMonthRange) ? (refDate >= since && refDate <= until) : (refDate >= since);
    });

    const completedTodos = rangedTodos.filter(t => t.status === TodoStatus.COMPLETED);

    // ── 3. Summary ────────────────────────────────────────────────────────────
    const tasksWithPomodoro    = completedTodos.filter(t => t.pomodoroCompleted).length;
    const tasksWithoutPomodoro = completedTodos.length - tasksWithPomodoro;
    const totalFocusMinutes    = completedTodos.reduce(
      (sum, t) => sum + (t.actualPomodoroTime ?? 0),
      0,
    );

    // ── 4. XP trend — one data-point per day in the range ────────────────────
    // Build ordered day keys (already populated above in dayKeys)

    const xpByDay = new Map<string, number>(dayKeys.map(k => [k, 0]));
    completedTodos.forEach(t => {
      if (t.completedAt) {
        const key = toDateKey(new Date(t.completedAt));
        if (xpByDay.has(key)) {
          xpByDay.set(key, (xpByDay.get(key) ?? 0) + (t.baseXp + t.bonusXp));
        }
      }
    });

    const xpTrend: XpTrendPoint[] = dayKeys.map(k => ({
      date: toLabel(k),
      xp:   xpByDay.get(k) ?? 0,
    }));

    // ── 5. Task by priority (pomodoro vs non-pomodoro, completed only) ────────
    const priorityMap: Record<TodoPriority, { pomodoro: number; nonPomodoro: number }> = {
      [TodoPriority.LOW]:    { pomodoro: 0, nonPomodoro: 0 },
      [TodoPriority.MEDIUM]: { pomodoro: 0, nonPomodoro: 0 },
      [TodoPriority.HIGH]:   { pomodoro: 0, nonPomodoro: 0 },
    };
    completedTodos.forEach(t => {
      const bucket = priorityMap[t.priority];
      if (!bucket) return;
      if (t.pomodoroCompleted) bucket.pomodoro++;
      else bucket.nonPomodoro++;
    });

    const taskByPriority: TaskPriorityPoint[] = [
      { name: 'Low',    ...priorityMap[TodoPriority.LOW] },
      { name: 'Medium', ...priorityMap[TodoPriority.MEDIUM] },
      { name: 'High',   ...priorityMap[TodoPriority.HIGH] },
    ];

    // ── 6. Heatmap — completed tasks per day (0–4 clamped) ────────────────────
    const countByDay = new Map<string, number>(dayKeys.map(k => [k, 0]));
    completedTodos.forEach(t => {
      if (t.completedAt) {
        const key = toDateKey(new Date(t.completedAt));
        if (countByDay.has(key)) countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
      }
    });

    const heatmap: HeatmapPoint[] = dayKeys.map(k => ({
      date:  toLabel(k),
      value: Math.min(countByDay.get(k) ?? 0, 4),
    }));

    // ── 7. Task table ─────────────────────────────────────────────────────────
    const tasks: ReportTaskItem[] = completedTodos
      .sort((a, b) => {
        const aDate = new Date(a.completedAt ?? a.updatedAt ?? a.createdAt).getTime();
        const bDate = new Date(b.completedAt ?? b.updatedAt ?? b.createdAt).getTime();
        return bDate - aDate; // newest first
      })
      .map(t => ({
        id:           t.id,
        name:         t.title,
        priority:     cap(t.priority) as 'Low' | 'Medium' | 'High',
        completed:    t.status === TodoStatus.COMPLETED,
        pomodoroUsed: t.pomodoroCompleted,
        xpEarned:     t.xpCounted ? t.baseXp + t.bonusXp : 0,
        status:       t.status === TodoStatus.COMPLETED ? 'Completed' : 'Expired',
        date:         (t.completedAt ?? t.updatedAt ?? t.createdAt).toISOString().slice(0, 10),
      }));

    // ── 8. Badges ─────────────────────────────────────────────────────────────
    const defMap = new Map(allBadgeDefs.map(d => [d.key, d]));
    const badges: ReportBadgeItem[] = allBadgeDefs.map(def => {
      const earned = userBadges.find(ub => ub.badgeKey === def.key);
      return {
        id:       def.id,
        name:     def.name,
        icon:     def.iconUrl ?? '🏅',
        unlocked: Boolean(earned),
        earnedAt: earned?.earnedAt?.toISOString(),
      };
    });

    // ── 9. Gamification summary ───────────────────────────────────────────────
    const gami = gamification ?? {
      totalXp:       0,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel:  1,
      currentTitle:  'Beginner - Starting Point',
    };

    return {
      summary: {
        totalXp:              gami.totalXp,
        currentStreak:        gami.currentStreak,
        longestStreak:        gami.longestStreak,
        currentLevel:         gami.currentLevel,
        currentTitle:         gami.currentTitle,
        tasksCompleted:       completedTodos.length,
        tasksWithPomodoro,
        tasksWithoutPomodoro,
        totalFocusMinutes,
        roomsJoined,
      },
      xpTrend,
      taskByPriority,
      heatmap,
      tasks,
      badges,
    };
  }
}
