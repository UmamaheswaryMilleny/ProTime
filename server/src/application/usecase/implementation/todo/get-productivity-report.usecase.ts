import { inject, injectable } from 'tsyringe';

import type { ITodoRepository }           from '../../../../domain/repositories/todo/todo.repository.interface';
import type { IGamificationRepository }   from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IUserBadgeRepository }       from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IBadgeDefinitionRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IStudyRoomRepository }      from '../../../../domain/repositories/study-room/study-room.repository.interface';
import type { ISubscriptionRepository }   from '../../../../domain/repositories/subscription/subscription.repository.interface';

import { TodoStatus, TodoPriority }  from '../../../../domain/enums/todo.enums';
import { RoomStatus } from '../../../../domain/enums/study-room.enums';
import type {
  IGetProductivityReportUsecase,
  ProductivityReportDTO,
  ReportRange,
  XpTrendPoint,
  TaskPriorityPoint,
  HeatmapPoint,
  ReportTaskItem,
  ReportBadgeItem,
  ReportRoomItem,
} from '../../interface/todo/get-productivity-report.usecase.interface';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a Date to midnight UTC string YYYY-MM-DD */
const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

/** Format a date string as short weekday label "Mon 14" */
const toLabel = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
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

    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: string, range: ReportRange, month?: string): Promise<ProductivityReportDTO> {
    const allTodos = await this.todoRepository.findByUserId(userId, 'all');

    let since: Date;
    let until: Date;
    let dayKeys: string[] = [];
    const isCalendarMonth = month && /^\d{4}-\d{2}$/.test(month);
    const isMonthRange = month && /^\d{4}-\d{2}_\d{4}-\d{2}$/.test(month);
    const isDateRange = month && /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/.test(month);

    if (isDateRange) {
      const parts = month!.split('_');
      const startStr = parts[0] || '';
      const endStr = parts[1] || '';
      const startParts = startStr.split('-').map(Number);
      const endParts = endStr.split('-').map(Number);

      const startYear = startParts[0] || 2026;
      const startMonthVal = startParts[1] || 1;
      const startDayVal = startParts[2] || 1;
      const endYear = endParts[0] || 2026;
      const endMonthVal = endParts[1] || 12;
      const endDayVal = endParts[2] || 31;

      since = new Date(Date.UTC(startYear, startMonthVal - 1, startDayVal, 0, 0, 0, 0));
      until = new Date(Date.UTC(endYear, endMonthVal - 1, endDayVal, 23, 59, 59, 999));

      const temp = new Date(since);
      while (temp <= until) {
        dayKeys.push(toDateKey(temp));
        temp.setUTCDate(temp.getUTCDate() + 1);
      }
    } else if (isMonthRange) {
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
    const midTime = since.getTime() + (until.getTime() - since.getTime()) / 2;
    const midDate = new Date(midTime);

    const [gamification, userBadges, allBadgeDefs, roomsJoined, firstHalfRooms, secondHalfRooms] = await Promise.all([
      this.gamificationRepository.findByUserId(userId),
      this.userBadgeRepository.findAllByUserId(userId),
      this.badgeDefinitionRepository.findAllActive(),
      this.studyRoomRepository.countJoinedOrHostedInMonth(userId, since, until),
      this.studyRoomRepository.countJoinedOrHostedInMonth(userId, since, midDate),
      this.studyRoomRepository.countJoinedOrHostedInMonth(userId, new Date(midTime + 1), until),
    ]);

    // ── 2. Filter todos to date range ──────────────────────────────────────────
    // Use completedAt for completed tasks, createdAt for expired tasks
    const rangedTodos = allTodos.filter(t => {
      const ref = t.completedAt ?? t.updatedAt ?? t.createdAt;
      const refDate = new Date(ref);
      return (isCalendarMonth || isMonthRange || isDateRange) ? (refDate >= since && refDate <= until) : (refDate >= since);
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
          const earned = t.xpCounted ? (t.baseXp + t.bonusXp) : 0;
          xpByDay.set(key, (xpByDay.get(key) ?? 0) + earned);
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

    // ── 6. Heatmap — completed tasks per day (always calendar years Jan 1st - Dec 31st) ──
    const endYear = new Date().getFullYear();
    let startYear = endYear - 2; // cover current, last year, year before last (e.g. 2026, 2025, 2024)
    allTodos.forEach(t => {
      if (t.status === TodoStatus.COMPLETED && t.completedAt) {
        const y = new Date(t.completedAt).getFullYear();
        if (y < startYear) startYear = y;
      }
    });
    const heatmapDayKeys: string[] = [];
    
    for (let y = startYear; y <= endYear; y++) {
      const yearStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
      const yearEnd = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      const temp = new Date(yearStart);
      while (temp <= yearEnd) {
        heatmapDayKeys.push(toDateKey(temp));
        temp.setUTCDate(temp.getUTCDate() + 1);
      }
    }

    const countByDayHeatmap = new Map<string, number>(heatmapDayKeys.map(k => [k, 0]));
    allTodos.forEach(t => {
      if (t.status === TodoStatus.COMPLETED && t.completedAt) {
        const key = toDateKey(new Date(t.completedAt));
        if (countByDayHeatmap.has(key)) {
          countByDayHeatmap.set(key, (countByDayHeatmap.get(key) ?? 0) + 1);
        }
      }
    });

    const heatmap: HeatmapPoint[] = heatmapDayKeys.map(k => ({
      date:  toLabel(k),
      value: countByDayHeatmap.get(k) ?? 0,
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
        date:         (t.completedAt ?? t.updatedAt ?? t.createdAt).toISOString(),
        completionType: t.completionType ?? 'SOLO',
        completedWithBuddyName: t.completedWithBuddyName ?? null,
        completedInRoomName: t.completedInRoomName ?? null,
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
        description: def.description,
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

    // Calculate XP breakdown
    let periodTaskBase = 0;
    let periodTaskPomodoro = 0;
    completedTodos.forEach(t => {
      if (t.xpCounted) {
        periodTaskBase += t.baseXp;
        periodTaskPomodoro += t.bonusXp;
      }
    });

    const sub = await this.subscriptionRepository.findByUserId(userId);
    const userIsPremium = sub ? sub.plan !== 'FREE' && sub.status === 'ACTIVE' : false;
    const badgeXpFactor = userIsPremium ? 50 : 20;

    const periodBadgesEarned = userBadges.filter(ub => {
      if (!ub.earnedAt) return false;
      const earnedAt = new Date(ub.earnedAt);
      return earnedAt >= since && earnedAt <= until;
    });
    const periodBadgeXp = periodBadgesEarned.length * badgeXpFactor;

    let lifetimeTaskBase = 0;
    let lifetimeTaskPomodoro = 0;
    allTodos.forEach(t => {
      if (t.status === TodoStatus.COMPLETED && t.xpCounted) {
        lifetimeTaskBase += t.baseXp;
        lifetimeTaskPomodoro += t.bonusXp;
      }
    });
    const lifetimeBadgeXp = userBadges.length * badgeXpFactor;
    const lifetimeStreakXp = Math.max(0, gami.totalXp - (lifetimeTaskBase + lifetimeTaskPomodoro + lifetimeBadgeXp));

    let periodStreakXp = 0;
    if (range === 'all') {
      periodStreakXp = lifetimeStreakXp;
    }

    const xpBreakdown = {
      tasks: periodTaskBase,
      pomodoro: periodTaskPomodoro,
      badges: periodBadgeXp,
      streaks: periodStreakXp,
    };

    // Fetch study rooms joined or hosted by the user in this range
    const studyRooms = await this.studyRoomRepository.findJoinedOrHostedInRange(userId, since, until);
    const rooms: ReportRoomItem[] = studyRooms.map(room => {
      const isHost = room.hostId === userId;
      const start = room.sessionStartedAt ? new Date(room.sessionStartedAt) : null;
      let durationMinutes = 0;
      if (start) {
        if (room.status === RoomStatus.LIVE) {
          durationMinutes = Math.max(0, Math.round((Date.now() - start.getTime()) / 60000));
        } else if (room.status === RoomStatus.ENDED) {
          const end = room.updatedAt ? new Date(room.updatedAt) : new Date();
          durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
        }
      }
      return {
        id: room.id!,
        name: room.name,
        role: isHost ? 'Host' : 'Participant',
        durationMinutes,
        date: (room.sessionStartedAt || room.createdAt || new Date()).toISOString(),
        status: room.status,
        features: room.features || [],
        maxParticipants: room.maxParticipants,
        currentParticipants: room.participantIds.length
      };
    });

    const calculatedTotalXp = periodTaskBase + periodTaskPomodoro + periodBadgeXp + periodStreakXp;

    return {
      summary: {
        totalXp:              calculatedTotalXp,
        currentStreak:        gami.currentStreak,
        longestStreak:        gami.longestStreak,
        currentLevel:         gami.currentLevel,
        currentTitle:         gami.currentTitle,
        tasksCompleted:       completedTodos.length,
        tasksWithPomodoro,
        tasksWithoutPomodoro,
        totalFocusMinutes,
        roomsJoined,
        roomsJoinedFirstHalf:  firstHalfRooms,
        roomsJoinedSecondHalf: secondHalfRooms,
        xpBreakdown,
      },
      xpTrend,
      taskByPriority,
      heatmap,
      tasks,
      badges,
      rooms,
    };
  }
}
