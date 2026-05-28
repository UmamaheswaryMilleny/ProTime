import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

export interface TaskRecord {
    id: string;
    name: string;
    priority: 'Low' | 'Medium' | 'High';
    completed: boolean;
    pomodoroUsed: boolean;
    xpEarned: number;
    status: 'Completed' | 'Expired';
    date: string;
}

interface ReportTaskTableProps {
    tasks: TaskRecord[];
}

export const ReportTaskTable: React.FC<ReportTaskTableProps> = ({ tasks }) => {
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [page, setPage] = useState<number>(1);
    
    // Reset page to 1 when filters or tasks list changes
    useEffect(() => {
        setPage(1);
    }, [filterPriority, tasks]);
    
    const filteredTasks = tasks.filter(t => filterPriority === 'All' || t.priority === filterPriority);

    const itemsPerPage = 5;
    const totalItems = filteredTasks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginatedTasks = filteredTasks.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h3 className="text-white font-semibold">Task Breakdown</h3>
                
                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-white border border-white/5">
                            <Filter size={14} />
                            Priority: {filterPriority}
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                            {['All', 'High', 'Medium', 'Low'].map(p => (
                                <button 
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-zinc-500 text-sm">
                            <th className="pb-3 font-medium px-4">Task Name</th>
                            <th className="pb-3 font-medium px-4">Priority</th>
                            <th className="pb-3 font-medium px-4 text-center">Completed</th>
                            <th className="pb-3 font-medium px-4 text-center">Pomodoro Used</th>
                            <th className="pb-3 font-medium px-4 text-right">XP Earned</th>
                            <th className="pb-3 font-medium px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-zinc-500">
                                    No tasks found for this filter.
                                </td>
                            </tr>
                        ) : paginatedTasks.map(task => (
                            <tr key={task.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-4 text-white text-sm max-w-[200px] truncate">{task.name}</td>
                                <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                                        task.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {task.completed ? <CheckCircle size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-zinc-600 mx-auto" />}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {task.pomodoroUsed ? <span className="text-xs bg-[blueviolet]/10 text-[blueviolet] px-2 py-1 rounded">Yes</span> : <span className="text-xs text-zinc-500">No</span>}
                                </td>
                                <td className="py-3 px-4 text-right text-white font-medium">
                                    +{task.xpEarned}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`text-xs ${task.status === 'Completed' ? 'text-green-400' : 'text-red-400'}`}>
                                        {task.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/5">
                    <div className="text-sm text-zinc-400">
                        Showing <span className="font-semibold text-white">{Math.min(totalItems, (page - 1) * itemsPerPage + 1)}</span> to{' '}
                        <span className="font-semibold text-white">{Math.min(totalItems, page * itemsPerPage)}</span> of{' '}
                        <span className="font-semibold text-white">{totalItems}</span> tasks
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                page === 1
                                    ? 'bg-zinc-900/50 border-white/5 text-zinc-600 cursor-not-allowed'
                                    : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700 hover:border-white/20 cursor-pointer'
                            }`}
                        >
                            ← Prev
                        </button>
                        <span className="text-xs text-zinc-500">
                            Page <span className="text-white font-semibold">{page}</span> / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                page === totalPages
                                    ? 'bg-zinc-900/50 border-white/5 text-zinc-600 cursor-not-allowed'
                                    : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700 hover:border-white/20 cursor-pointer'
                            }`}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
