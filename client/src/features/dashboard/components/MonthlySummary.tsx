import React from 'react';
import { FileText } from 'lucide-react';
import { reportsService } from '../services/reports.service';
import type { ProductivityReportData } from '../types/reports.types';

export const MonthlySummary: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [reportData, setReportData] = React.useState<ProductivityReportData | null>(null);

    const now = new Date();
    const year = now.getFullYear();
    const monthVal = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthStr = `${year}-${monthVal}`; // e.g. "2026-05"
    const displayMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    React.useEffect(() => {
        const fetchMonthlyReport = async () => {
            try {
                const data = await reportsService.getProductivityReport('custom', currentMonthStr);
                setReportData(data);
            } catch (error) {
                console.error('Failed to fetch monthly report', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyReport();
    }, [currentMonthStr]);



    const calculateTrends = () => {
        if (!reportData) return { taskTrend: '+0%', pomoTrend: '+0%', xpTrend: '+0%', roomsTrend: '+0%' };

        const midDay = Math.ceil(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() / 2);

        // Tasks trends
        const firstHalfTasks = reportData.tasks.filter(t => t.completed && parseInt(t.date.split('-')[2], 10) <= midDay).length;
        const secondHalfTasks = reportData.tasks.filter(t => t.completed && parseInt(t.date.split('-')[2], 10) > midDay).length;
        let taskTrendVal = 0;
        if (firstHalfTasks > 0) {
            taskTrendVal = Math.round(((secondHalfTasks - firstHalfTasks) / firstHalfTasks) * 100);
        } else if (secondHalfTasks > 0) {
            taskTrendVal = 100;
        }
        const taskTrend = taskTrendVal >= 0 ? `+${taskTrendVal}%` : `${taskTrendVal}%`;

        // Pomodoro trends
        const firstHalfPomo = reportData.tasks.filter(t => t.completed && t.pomodoroUsed && parseInt(t.date.split('-')[2], 10) <= midDay).length;
        const secondHalfPomo = reportData.tasks.filter(t => t.completed && t.pomodoroUsed && parseInt(t.date.split('-')[2], 10) > midDay).length;
        let pomoTrendVal = 0;
        if (firstHalfPomo > 0) {
            pomoTrendVal = Math.round(((secondHalfPomo - firstHalfPomo) / firstHalfPomo) * 100);
        } else if (secondHalfPomo > 0) {
            pomoTrendVal = 100;
        }
        const pomoTrend = pomoTrendVal >= 0 ? `+${pomoTrendVal}%` : `${pomoTrendVal}%`;

        // XP trends
        const halfIndex = Math.floor(reportData.xpTrend.length / 2);
        const firstHalfXp = reportData.xpTrend.slice(0, halfIndex).reduce((sum, p) => sum + p.xp, 0);
        const secondHalfXp = reportData.xpTrend.slice(halfIndex).reduce((sum, p) => sum + p.xp, 0);
        let xpTrendVal = 0;
        if (firstHalfXp > 0) {
            xpTrendVal = Math.round(((secondHalfXp - firstHalfXp) / firstHalfXp) * 100);
        } else if (secondHalfXp > 0) {
            xpTrendVal = 100;
        }
        const xpTrend = xpTrendVal >= 0 ? `+${xpTrendVal}%` : `${xpTrendVal}%`;

        // Rooms trends
        const firstHalfRooms = reportData.summary.roomsJoinedFirstHalf ?? 0;
        const secondHalfRooms = reportData.summary.roomsJoinedSecondHalf ?? 0;
        let roomsTrendVal = 0;
        if (firstHalfRooms > 0) {
            roomsTrendVal = Math.round(((secondHalfRooms - firstHalfRooms) / firstHalfRooms) * 100);
        } else if (secondHalfRooms > 0) {
            roomsTrendVal = 100;
        }
        const roomsTrend = roomsTrendVal >= 0 ? `+${roomsTrendVal}%` : `${roomsTrendVal}%`;

        return { taskTrend, pomoTrend, xpTrend, roomsTrend };
    };

    const trends = calculateTrends();

    const formatXp = (xp: number): string => {
        if (xp >= 1000) {
            return `${(xp / 1000).toFixed(1)}k`;
        }
        return String(xp);
    };

    const monthlyXp = reportData ? reportData.xpTrend.reduce((sum, p) => sum + p.xp, 0) : 0;

    const stats = [
        {
            label: 'Tasks Completed',
            value: reportData ? String(reportData.summary.tasksCompleted) : '0',
            trend: trends.taskTrend,
            trendValue: parseInt(trends.taskTrend, 10)
        },
        {
            label: 'Pomodoro Sessions',
            value: reportData ? String(reportData.summary.tasksWithPomodoro) : '0',
            trend: trends.pomoTrend,
            trendValue: parseInt(trends.pomoTrend, 10)
        },
        {
            label: 'XP Earned',
            value: formatXp(monthlyXp),
            trend: trends.xpTrend,
            trendValue: parseInt(trends.xpTrend, 10)
        },
        {
            label: 'Rooms Joined',
            value: reportData ? String(reportData.summary.roomsJoined) : '0',
            trend: trends.roomsTrend,
            trendValue: parseInt(trends.roomsTrend, 10)
        },
    ];

    const getTrendColor = (trendVal: number) => {
        if (trendVal > 0) return 'text-[#22C55E]';
        if (trendVal < 0) return 'text-[#EF4444]';
        return 'text-[#71717A]';
    };

    const getPerformanceInsight = () => {
        if (!reportData) return "Keep maintaining your current rhythm to hit your goals.";
        const { summary } = reportData;
        const total = summary.tasksCompleted;
        const pomoCount = summary.tasksWithPomodoro;
        const pomoPct = total > 0 ? Math.round((pomoCount / total) * 100) : 0;

        if (total === 0) {
            return "No tasks completed yet this month. Complete a task to generate performance insights!";
        }
        if (summary.currentStreak > 1) {
            return `You're on a ${summary.currentStreak}-day streak! Keep it up to boost your productivity.`;
        }
        if (pomoPct >= 50) {
            return `Amazing! You completed ${pomoPct}% of your tasks using Pomodoro this month.`;
        }
        if (pomoPct < 30) {
            return `Try using the Pomodoro timer more often — it earns you bonus XP on completed tasks!`;
        }
        return `You completed ${total} tasks this month. Keep maintaining your rhythm to hit your goals!`;
    };

    if (loading) {
        return (
            <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-6 animate-pulse h-[250px]">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-zinc-850 rounded" />
                    <div className="h-8 w-20 bg-zinc-850 rounded" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-3 w-20 bg-zinc-850 rounded" />
                            <div className="h-8 w-16 bg-zinc-850 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-6 fade-in h-min">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Monthly Summary</h2>
                    <p className="text-sm text-[#A1A1AA] mt-1">Your performance snapshot for {displayMonthName}.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                            <span className={`text-[10px] font-bold ${getTrendColor(stat.trendValue)}`}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#2563EB]/5 rounded-xl p-4 flex items-center gap-4 border border-[#2563EB]/10">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="text-xs text-zinc-300">
                        <span className="font-bold text-white text-[13px]">Performance Insight:</span> {getPerformanceInsight()}
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">Keep maintaining your current rhythm to hit your goals.</p>
                </div>
            </div>
        </div>
    );
};

