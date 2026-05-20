import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    ReferenceLine
} from 'recharts';

interface ReportChartsProps {
    xpData: { date: string; xp: number }[];
    taskData: { name: string; pomodoro: number; nonPomodoro: number }[];
    heatmapData: { date: string; value: number }[]; // value 0-4 for intensity
}

export const ReportCharts: React.FC<ReportChartsProps> = ({ xpData, taskData, heatmapData }) => {

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-800 border border-white/10 p-3 rounded-lg shadow-xl">
                    <p className="text-zinc-300 text-sm mb-1">{label}</p>
                    <p className="text-white font-bold">{payload[0].name}: {payload[0].value}</p>
                    {payload[1] && <p className="text-white font-bold">{payload[1].name}: {payload[1].value}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* XP Progress Chart */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                        XP Progress (7 Days)
                        <span className="text-xs font-normal text-zinc-500 ml-auto bg-zinc-800 px-2 py-1 rounded">Daily Cap: 50 XP</span>
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={xpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} domain={[0, 60]} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: 'Cap', fill: 'red', fontSize: 10 }} />
                                <Line type="monotone" dataKey="xp" name="XP Earned" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Completion Chart */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-white font-semibold mb-6">Task Completion (By Priority)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="pomodoro" name="With Pomodoro" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="nonPomodoro" name="Without Pomodoro" fill="#3f3f46" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Streak Activity Heatmap */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm overflow-x-auto custom-scrollbar">
                <h3 className="text-white font-semibold mb-4">Streak Activity (Last 30 Days)</h3>
                <div className="flex gap-1 items-end min-w-max">
                    {heatmapData.map((day, idx) => {
                        // value is 0-4
                        let bgClass = "bg-zinc-800"; // 0
                        if (day.value === 1) bgClass = "bg-[#4a2e85]";
                        if (day.value === 2) bgClass = "bg-[#6c40cc]";
                        if (day.value === 3) bgClass = "bg-[#8b5cf6]";
                        if (day.value === 4) bgClass = "bg-[#a78bfa]";

                        return (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative">
                                <div className={`w-4 h-4 rounded-sm ${bgClass} transition-colors hover:ring-2 ring-white/50 cursor-pointer`} />
                                {/* Simple Tooltip */}
                                <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    {day.date}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-zinc-800"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#4a2e85]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#6c40cc]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#8b5cf6]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#a78bfa]"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};
