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
import { Info, ChevronDown } from 'lucide-react';

interface ReportChartsProps {
    xpData: { date: string; xp: number }[];
    taskData: { name: string; pomodoro: number; nonPomodoro: number }[];
    heatmapData: { date: string; value: number }[]; // value 0-4 for intensity
}

export const ReportCharts: React.FC<ReportChartsProps> = ({ xpData, taskData, heatmapData }) => {
    const [selectedPeriod, setSelectedPeriod] = React.useState<string>('Current');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

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

    // Helper to get the year from date string (format is like "Wed, 6/24/2026")
    const getYear = (dateStr: string): string => {
        const parts = dateStr.split('/');
        return parts[parts.length - 1] || '';
    };

    // Filter heatmapData based on selectedPeriod
    const filteredHeatmapData = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        let yearToFilter = currentYear;
        if (selectedPeriod === 'Last Year') {
            yearToFilter = currentYear - 1;
        } else if (selectedPeriod === 'Year Before Last') {
            yearToFilter = currentYear - 2;
        }
        const yearStr = yearToFilter.toString();
        return heatmapData.filter(day => getYear(day.date) === yearStr);
    }, [heatmapData, selectedPeriod]);

    // Calculate stats based on filtered data
    const totalPeriodTasks = React.useMemo(() => {
        return filteredHeatmapData.reduce((sum, day) => sum + day.value, 0);
    }, [filteredHeatmapData]);

    const activeDays = React.useMemo(() => {
        return filteredHeatmapData.filter(day => day.value > 0).length;
    }, [filteredHeatmapData]);

    const maxStreak = React.useMemo(() => {
        let max = 0;
        let current = 0;
        for (const day of filteredHeatmapData) {
            if (day.value > 0) {
                current++;
                if (current > max) max = current;
            } else {
                current = 0;
            }
        }
        return max;
    }, [filteredHeatmapData]);

    // Helper to group heatmapData into 7-row grid columns (Sunday to Saturday)
    const getGridColumns = (data: typeof heatmapData) => {
        if (!data || data.length === 0) return [];
        
        const weekdayMap: Record<string, number> = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        };
        const getDayIndex = (dateStr: string) => {
            const prefix = dateStr.slice(0, 3);
            return weekdayMap[prefix] ?? 0;
        };

        const firstDayOfWeek = getDayIndex(data[0].date);
        
        const cols: (typeof heatmapData[0] | null)[][] = [];
        let currentCol: (typeof heatmapData[0] | null)[] = Array(7).fill(null);
        
        let dayIdx = firstDayOfWeek;
        
        for (const item of data) {
            currentCol[dayIdx] = item;
            dayIdx++;
            if (dayIdx > 6) {
                cols.push(currentCol);
                currentCol = Array(7).fill(null);
                dayIdx = 0;
            }
        }
        
        if (dayIdx > 0) {
            cols.push(currentCol);
        }
        
        return cols;
    };

    const gridColumns = getGridColumns(filteredHeatmapData);
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Align month labels at the bottom of the columns
    const getColMonthLabels = () => {
        const renderedMonths = new Set<number>();
        return gridColumns.map((col) => {
            for (const day of col) {
                if (!day) continue;
                const parts = day.date.split(', ')[1]?.split('/');
                if (!parts) continue;
                const monthNum = parseInt(parts[0], 10);
                if (!renderedMonths.has(monthNum)) {
                    renderedMonths.add(monthNum);
                    return monthNames[monthNum] || '';
                }
            }
            return '';
        });
    };

    const colMonthLabels = getColMonthLabels();

    return (
        <div className="flex flex-col gap-6 mb-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* XP Progress Chart */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm min-w-0">
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
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm min-w-0">
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
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm overflow-x-auto scrollbar-none">
                
                {/* LeetCode Header Design */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">
                            {totalPeriodTasks}
                        </span>
                        <span className="text-zinc-400 text-sm">
                            tasks completed {selectedPeriod === 'Current' ? 'in the selected period' : `in ${selectedPeriod}`}
                        </span>
                        <div className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer group relative">
                            <Info size={14} />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-white text-[10px] p-2 rounded shadow-lg border border-white/10 pointer-events-none whitespace-nowrap z-50">
                                Counts all completed tasks in this period
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 self-end sm:self-auto">
                        <span className="text-xs text-zinc-400">
                            Total active days: <span className="text-white font-semibold">{activeDays}</span>
                        </span>
                        <span className="text-xs text-zinc-400">
                            Max streak: <span className="text-white font-semibold">{maxStreak}</span>
                        </span>
                        
                        {/* Year Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c2c2c] hover:bg-zinc-800 border border-white/10 rounded-lg text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                            >
                                {selectedPeriod}
                                <ChevronDown size={12} className="text-zinc-400" />
                            </button>
                            
                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#2c2c2c] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {['Current', 'Last Year', 'Year Before Last'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setSelectedPeriod(p);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                            >
                                                {p}
                                                {selectedPeriod === p && <span className="text-green-400 font-semibold text-[10px]">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contribution Grid */}
                <div className="flex min-w-max py-2">
                    <div className="flex gap-[3px]">
                        {gridColumns.map((col, colIdx) => {
                            const isNewMonth = colIdx > 0 && colMonthLabels[colIdx] !== "";
                            return (
                                <div 
                                    key={colIdx} 
                                    className={`flex flex-col gap-[3px] relative pb-6 ${isNewMonth ? 'ml-[10px]' : ''}`}
                                >
                                    {col.map((day, rowIdx) => {
                                        if (!day) {
                                            return (
                                                <div 
                                                    key={rowIdx} 
                                                    className="w-2.5 h-2.5 rounded-[2px] bg-transparent" 
                                                />
                                            );
                                        }

                                        const bgClass = day.value > 0 ? "bg-[blueviolet]" : "bg-[#2c2c2c]";

                                        return (
                                            <div key={rowIdx} className="group relative">
                                                <div className={`w-2.5 h-2.5 rounded-[2px] ${bgClass} transition-colors hover:ring-1 hover:ring-white/40 cursor-pointer`} />
                                                {/* Tooltip */}
                                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white text-[9px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                                                    {day.value === 0 ? 'No completed tasks' : `${day.value} task${day.value > 1 ? 's' : ''}`} on {day.date}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Month label at the bottom */}
                                    {colMonthLabels[colIdx] && (
                                        <span className="absolute left-0 bottom-0 text-[9px] text-zinc-500 font-semibold whitespace-nowrap font-sans">
                                            {colMonthLabels[colIdx]}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500">
                    <span>No tasks</span>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#2c2c2c]"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[blueviolet]"></div>
                    <span>Active day</span>
                </div>
            </div>
        </div>
    );
};
