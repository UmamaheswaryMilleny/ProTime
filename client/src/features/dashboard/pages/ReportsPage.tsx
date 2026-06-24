import React, { useState, useEffect, useCallback } from 'react';
import { Download, Lock, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { updateUser } from '../../auth/store/authSlice';
import { subscriptionService } from '../api/subscription-service';

// Components
import { ReportSummaryCards }  from '../components/reports/ReportSummaryCards';
import { ReportCharts }        from '../components/reports/ReportCharts';
import { ReportInsights }      from '../components/reports/ReportInsights';
import { ReportGameProgress }  from '../components/reports/ReportGameProgress';
import { ReportTaskTable, type TaskRecord } from '../components/reports/ReportTaskTable';

// Service + types
import { reportsService }      from '../services/reports.service';
import type { ProductivityReportData } from '../types/reports.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── XP-threshold per level (simple linear: 500 * level) ─────────────────────
const nextLevelXp = (level: number) => level * 500;

// ─── Derive smart insights from real data ───────────────────────────────────
const buildInsights = (data: ProductivityReportData) => {
    const insights: { icon: 'sparkles' | 'trending' | 'target'; text: string }[] = [];

    const { summary, taskByPriority, xpTrend } = data;

    // Pomodoro usage insight
    const total = summary.tasksCompleted || 1;
    const pomoPct = Math.round((summary.tasksWithPomodoro / total) * 100);
    if (pomoPct >= 50) {
        insights.push({
            icon: 'sparkles',
            text: `You use the Pomodoro timer for ${pomoPct}% of your tasks — keep using it for bonus XP!`,
        });
    } else {
        insights.push({
            icon: 'sparkles',
            text: `Try enabling the Pomodoro timer more often — it earns you bonus XP on every task!`,
        });
    }

    // Streak insight
    if (summary.currentStreak > 0) {
        insights.push({
            icon: 'trending',
            text: `You're on a ${summary.currentStreak}-day streak! Your longest is ${summary.longestStreak} days — can you beat it?`,
        });
    } else {
        insights.push({
            icon: 'trending',
            text: `Start a streak today — complete a task with Pomodoro to begin your streak counter!`,
        });
    }

    // Best priority insight
    const bestPriority = taskByPriority.reduce(
        (best, p) => (p.pomodoro + p.nonPomodoro > best.pomodoro + best.nonPomodoro ? p : best),
        taskByPriority[0] ?? { name: 'High', pomodoro: 0, nonPomodoro: 0 },
    );

    // XP trend insight
    const nonZeroDays = xpTrend.filter(d => d.xp > 0).length;
    insights.push({
        icon: 'target',
        text: nonZeroDays > 0
            ? `You earned XP on ${nonZeroDays} out of ${xpTrend.length} days. Your most active priority is ${bestPriority.name}.`
            : `No XP earned yet this period. Complete tasks to start climbing the leaderboard!`,
    });

    return insights;
};

// ─── Format minutes → "Xh Ym" ────────────────────────────────────────────────
const formatFocusTime = (minutes: number): string => {
    if (minutes === 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ReportsPage: React.FC = () => {
    const { user }             = useAppSelector(state => state.auth);
    const dispatch             = useAppDispatch();
    const [loading, setLoading]       = useState(true);
    const [filterType, setFilterType] = useState<'overall' | 'date-range'>('overall');
    const [reportData, setReportData] = useState<ProductivityReportData | null>(null);
    const [error, setError]           = useState<string | null>(null);

    const isPremium = user?.isPremium ?? false;

    // Sync premium state from server to prevent stale client sessions (e.g. expired subscriptions)
    useEffect(() => {
        const checkPremium = async () => {
            try {
                const data = await subscriptionService.getSubscription();
                if (data && data.isPremium !== user?.isPremium) {
                    dispatch(updateUser({ isPremium: data.isPremium }));
                }
            } catch (error) {
                console.error('Failed to sync premium state', error);
            }
        };
        checkPremium();
    }, [dispatch, user?.isPremium]);

    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState<string>(() => {
        return new Date().toISOString().slice(0, 10);
    });

    // ── Format period nicely for UI, CSV & PDF ────────────────────────────────
    const getDisplayPeriod = useCallback(() => {
        if (filterType === 'overall') {
            return 'Overall Progress';
        }
        
        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [year, month, day] = dateStr.split('-').map(Number);
            const d = new Date(Date.UTC(year, month - 1, day));
            return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        };
        
        return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    }, [filterType, startDate, endDate]);

    // ── Fetch real data ──────────────────────────────────────────────────────
    const fetchReport = useCallback(async (range: string, month?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportsService.getProductivityReport(range, month);
            setReportData(data);
        } catch {
            setError('Failed to load your report. Please try again.');
            toast.error('Could not load productivity report.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (filterType === 'overall') {
            fetchReport('all');
        } else {
            fetchReport('custom', `${startDate}_${endDate}`);
        }
    }, [filterType, startDate, endDate, fetchReport]);

    const handleStartDateChange = (val: string) => {
        setLoading(true);
        setStartDate(val);
        if (endDate && val > endDate) {
            setEndDate(val);
        }
    };

    const handleEndDateChange = (val: string) => {
        setLoading(true);
        setEndDate(val);
        if (startDate && val < startDate) {
            setStartDate(val);
        }
    };

    // ── Export handlers ───────────────────────────────────────────────────────


    const handleExportPdf = () => {
        if (!isPremium || !reportData) return;

        const toastId = toast.loading('Generating your PDF report…');
        try {
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(22);
            doc.text('ProTime Productivity Report', 14, 22);
            doc.setFontSize(12);
            doc.setTextColor(100);
            const displayPeriod = getDisplayPeriod();
            doc.text(`Period: ${displayPeriod} | Exported: ${new Date().toLocaleDateString()}`, 14, 30);

            // Summary Info
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Summary', 14, 45);
            doc.setFontSize(10);
            
            const summary = reportData.summary;
            const focusStr = formatFocusTime(summary.totalFocusMinutes);
            
            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: [
                    ['Total XP Earned', summary.totalXp.toLocaleString()],
                    ['Level', `${summary.currentLevel} - ${summary.currentTitle}`],
                    ['Current Streak', `${summary.currentStreak} Days`],
                    ['Tasks Completed', summary.tasksCompleted.toString()],
                    ['Focus Time', focusStr],
                    ['Pomodoro Usage', `${summary.tasksWithPomodoro} used / ${summary.tasksWithoutPomodoro} unused`]
                ],
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] }
            });

            // Tasks Table
            doc.setFontSize(14);
            doc.text('Task Log', 14, (doc as any).lastAutoTable.finalY + 15);
            
            const taskData = reportData.tasks
                .filter(t => t.status === 'Completed')
                .map(t => [
                    t.name.length > 30 ? t.name.substring(0, 30) + '...' : t.name,
                    t.priority,
                    t.status,
                    t.pomodoroUsed ? 'Yes' : 'No',
                    t.xpEarned.toString(),
                    t.date
                ]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Task Name', 'Priority', 'Status', 'Pomo', 'XP', 'Date']],
                body: taskData.length > 0 ? taskData : [['No tasks found in this period', '', '', '', '', '']],
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] }
            });

            // Study Rooms Table
            if (reportData.rooms && reportData.rooms.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Study Room Sessions', 14, (doc as any).lastAutoTable.finalY + 15);
                
                const roomData = reportData.rooms.map(r => [
                    r.name.length > 30 ? r.name.substring(0, 30) + '...' : r.name,
                    r.role,
                    `${r.durationMinutes} mins`,
                    r.status,
                    r.features.join(', '),
                    new Date(r.date).toLocaleDateString()
                ]);

                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY + 20,
                    head: [['Room Name', 'Role', 'Duration', 'Status', 'Features', 'Date']],
                    body: roomData,
                    theme: 'grid',
                    headStyles: { fillColor: [13, 148, 136] }
                });
            }

            const filenameRange = filterType === 'date-range' ? `${startDate}_${endDate}` : 'overall';
            doc.save(`protime-report-${filenameRange}-${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('PDF downloaded successfully! 🎉', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('PDF Export failed. Please try again.', { id: toastId });
        }
    };

    // ── Derived data for sub-components ─────────────────────────────────────
    const summary   = reportData?.summary;
    const focusStr  = formatFocusTime(summary?.totalFocusMinutes ?? 0);

    const tasks: TaskRecord[] = (reportData?.tasks ?? [])
        .filter(t => t.status === 'Completed')
        .map(t => ({
            id:           t.id,
            name:         t.name,
            priority:     t.priority,
            completed:    t.completed,
            pomodoroUsed: t.pomodoroUsed,
            xpEarned:     t.xpEarned,
            status:       t.status,
            date:         t.date,
        }));

    const badges = (reportData?.badges ?? []).map(b => ({
        id:       b.id,
        name:     b.name,
        icon:     b.icon,
        unlocked: b.unlocked,
        description: b.description,
    }));

    const insights = reportData ? buildInsights(reportData) : [];

    return (
        <div className="p-6 md:p-8 min-h-screen bg-zinc-950 max-w-7xl mx-auto">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row xl:flex-wrap xl:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Your Productivity Report
                    </h1>
                    <p className="text-zinc-400">Track your progress, consistency, and performance</p>
                </div>

                <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 w-full xl:w-auto">
                    {/* Date Range Selector */}
                    <div className="flex flex-wrap items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 w-full md:w-auto">
                        {/* Selector for overall vs custom range */}
                        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 relative">
                            <CalendarIcon size={16} className="text-zinc-500 absolute left-3" />
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setLoading(true);
                                    setFilterType(e.target.value as 'overall' | 'date-range');
                                }}
                                className="bg-transparent text-white text-sm outline-none pl-9 pr-8 py-2 appearance-none cursor-pointer"
                            >
                                <option value="overall" className="bg-zinc-900 text-white">Overall Progress</option>
                                <option value="date-range" className="bg-zinc-900 text-white">Month to Month</option>
                            </select>
                            <ChevronDown size={14} className="text-zinc-500 absolute right-3 pointer-events-none" />
                        </div>

                        {/* Inputs for Date Range */}
                        {filterType === 'date-range' && (
                            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 relative">
                                    <span className="text-xs text-zinc-500 absolute left-3">From:</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className="bg-transparent text-white text-sm outline-none pl-14 pr-3 py-2 cursor-pointer [color-scheme:dark]"
                                    />
                                </div>

                                <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 relative">
                                    <span className="text-xs text-zinc-500 absolute left-3">To:</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        className="bg-transparent text-white text-sm outline-none pl-10 pr-3 py-2 cursor-pointer [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Buttons — Premium only */}
                    <div className="relative flex items-center gap-2 group w-full md:w-auto justify-end md:justify-start">
                        <button
                            disabled={!isPremium}
                            onClick={handleExportPdf}
                            className={`flex items-center gap-2 px-3 py-2 bg-[blueviolet] text-white font-semibold rounded-xl text-sm transition-all shadow-lg ${
                                !isPremium
                                    ? 'opacity-50 cursor-not-allowed grayscale bg-zinc-700'
                                    : 'hover:bg-purple-600 active:scale-95 shadow-purple-500/20'
                            }`}
                        >
                            {isPremium ? <Download size={16} /> : <Lock size={16} />}
                            Export PDF
                        </button>

                        {/* Premium Tooltip */}
                        {!isPremium && (
                            <div className="absolute top-full mt-2 right-0 w-64 bg-zinc-800 border border-white/10 p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                                <p className="text-sm text-white mb-2 font-medium">Premium Feature</p>
                                <p className="text-xs text-zinc-400 mb-3">
                                    Upgrade to Premium to export your reports as PDF.
                                </p>
                                <a href="/dashboard/subscription" className="text-xs font-semibold text-[blueviolet] hover:text-purple-400">
                                    View Plans →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Content Body ────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex flex-col gap-6 animate-pulse">
                    <div className="grid grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 bg-zinc-900 rounded-2xl" />
                        ))}
                    </div>
                    <div className="h-72 bg-zinc-900 rounded-2xl" />
                    <div className="h-48 bg-zinc-900 rounded-2xl" />
                </div>

            ) : error ? (
                <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-red-500/20 rounded-2xl">
                    <p className="text-red-400 font-semibold text-lg mb-2">Failed to Load Report</p>
                    <p className="text-zinc-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => fetchReport(filterType === 'overall' ? 'all' : 'custom', filterType === 'date-range' ? `${startDate}_${endDate}` : undefined)}
                        className="px-4 py-2 bg-[blueviolet] text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>

            ) : !reportData || tasks.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-white/5 rounded-2xl border-dashed">
                    <Lock size={48} className="text-zinc-600 mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">No Data Yet</h3>
                    <p className="text-zinc-400 text-sm text-center max-w-md">
                        Start completing tasks and tracking Pomodoro sessions to see your productivity report.
                    </p>
                </div>

            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ReportSummaryCards
                        totalXp={summary!.totalXp}
                        tasksTotal={summary!.tasksCompleted}
                        tasksPomodoro={summary!.tasksWithPomodoro}
                        tasksNonPomodoro={summary!.tasksWithoutPomodoro}
                        currentStreak={summary!.currentStreak}
                        longestStreak={summary!.longestStreak}
                        focusTimeStr={focusStr}
                    />

                    <ReportCharts
                        xpData={reportData.xpTrend}
                        taskData={reportData.taskByPriority}
                        heatmapData={reportData.heatmap}
                    />

                    <ReportInsights insights={insights} />

                    <ReportGameProgress
                        level={summary!.currentLevel}
                        title={summary!.currentTitle}
                        currentXp={summary!.totalXp}
                        nextLevelXp={nextLevelXp(summary!.currentLevel)}
                        badges={badges}
                    />

                    <ReportTaskTable tasks={tasks} badges={badges} rooms={reportData.rooms || []} isPremium={isPremium} />
                </div>
            )}
        </div>
    );
};
