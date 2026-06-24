import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import type { ReportRoom } from '../../types/reports.types';

export interface TaskRecord {
    id: string;
    name: string;
    priority: 'Low' | 'Medium' | 'High';
    completed: boolean;
    pomodoroUsed: boolean;
    xpEarned: number;
    status: 'Completed' | 'Expired';
    date: string;
    completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
    completedWithBuddyName?: string | null;
    completedInRoomName?: string | null;
}

export interface BadgeRecord {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    earnedAt?: string;
    description?: string;
}

interface ReportTaskTableProps {
    tasks: TaskRecord[];
    badges?: BadgeRecord[];
    rooms?: ReportRoom[];
    isPremium?: boolean;
}

export const ReportTaskTable: React.FC<ReportTaskTableProps> = ({ tasks, badges = [], rooms = [], isPremium = false }) => {
    const [viewType, setViewType] = useState<'tasks' | 'xp' | 'rooms'>('tasks');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [filterXpSource, setFilterXpSource] = useState<'All' | 'Tasks' | 'Badges'>('All');
    const [filterRoomRole, setFilterRoomRole] = useState<'All' | 'Host' | 'Participant'>('All');
    const [page, setPage] = useState<number>(1);
    
    // Reset page to 1 when filters or view type changes
    useEffect(() => {
        setPage(1);
    }, [filterPriority, filterXpSource, filterRoomRole, viewType, tasks, rooms]);
    
    // ─── Filtered Tasks ────────────────────────────────────────────────────────
    const filteredTasks = tasks.filter(t => filterPriority === 'All' || t.priority === filterPriority);

    // ─── XP Gained Records ─────────────────────────────────────────────────────
    const badgeXpFactor = isPremium ? 50 : 20;
    const xpRecords = [
        ...tasks.map(t => ({
            id: t.id,
            activity: `Completed task "${t.name}"`,
            category: 'TASK' as const,
            xpGained: t.xpEarned,
            date: t.date,
            details: t.pomodoroUsed ? 'Completed with Pomodoro boost' : 'Completed manually'
        })),
        ...badges
            .filter(b => b.unlocked && b.earnedAt)
            .map(b => ({
                id: b.id,
                activity: `Unlocked Badge: ${b.name} ${b.icon}`,
                category: 'BADGE' as const,
                xpGained: badgeXpFactor,
                date: b.earnedAt!,
                details: b.description || 'Badge achievement award'
            }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredXpRecords = xpRecords.filter(r => {
        if (filterXpSource === 'All') return true;
        if (filterXpSource === 'Tasks') return r.category === 'TASK';
        if (filterXpSource === 'Badges') return r.category === 'BADGE';
        return true;
    });

    // ─── Filtered Rooms ────────────────────────────────────────────────────────
    const filteredRooms = rooms.filter(r => filterRoomRole === 'All' || r.role === filterRoomRole);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const itemsPerPage = 10;
    const currentItems = 
        viewType === 'tasks' ? filteredTasks : 
        viewType === 'xp' ? filteredXpRecords : 
        filteredRooms;
    const totalItems = currentItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginatedItems = currentItems.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-4">
                {/* Tabs to Switch View */}
                <div className="flex gap-6">
                    <button 
                        onClick={() => setViewType('tasks')}
                        className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                            viewType === 'tasks' 
                                ? 'text-white border-[blueviolet]' 
                                : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                    >
                        Task Breakdown
                    </button>
                    <button 
                        onClick={() => setViewType('xp')}
                        className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                            viewType === 'xp' 
                                ? 'text-white border-[blueviolet]' 
                                : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                    >
                        XP Gained Breakdown
                    </button>
                    <button 
                        onClick={() => setViewType('rooms')}
                        className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                            viewType === 'rooms' 
                                ? 'text-white border-[blueviolet]' 
                                : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                    >
                        Study Sessions
                    </button>
                </div>
                
                {/* Dynamic Filters depending on view */}
                <div className="flex gap-3">
                    {viewType === 'tasks' ? (
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
                    ) : viewType === 'xp' ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-white border border-white/5">
                                <Filter size={14} />
                                Category: {filterXpSource}
                                <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                                {['All', 'Tasks', 'Badges'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setFilterXpSource(c as any)}
                                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-white border border-white/5">
                                <Filter size={14} />
                                Role: {filterRoomRole}
                                <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                                {['All', 'Host', 'Participant'].map(role => (
                                    <button 
                                        key={role}
                                        onClick={() => setFilterRoomRole(role as any)}
                                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-zinc-500 text-sm">
                            {viewType === 'tasks' ? (
                                <>
                                    <th className="pb-3 font-medium px-4">Task Name</th>
                                    <th className="pb-3 font-medium px-4">Priority</th>
                                    <th className="pb-3 font-medium px-4 text-center">Completed</th>
                                    <th className="pb-3 font-medium px-4 text-center">Pomodoro Used</th>
                                    <th className="pb-3 font-medium px-4 text-center">Completion Mode</th>
                                    <th className="pb-3 font-medium px-4 text-right">XP Earned</th>
                                    <th className="pb-3 font-medium px-4">Completed Time</th>
                                    <th className="pb-3 font-medium px-4">Status</th>
                                </>
                            ) : viewType === 'xp' ? (
                                <>
                                    <th className="pb-3 font-medium px-4">Activity Source</th>
                                    <th className="pb-3 font-medium px-4 text-center">Category</th>
                                    <th className="pb-3 font-medium px-4">Details</th>
                                    <th className="pb-3 font-medium px-4 text-right">XP Gained</th>
                                    <th className="pb-3 font-medium px-4">Time Earned</th>
                                </>
                            ) : (
                                <>
                                    <th className="pb-3 font-medium px-4">Room Name</th>
                                    <th className="pb-3 font-medium px-4 text-center">Role</th>
                                    <th className="pb-3 font-medium px-4 text-center">Duration</th>
                                    <th className="pb-3 font-medium px-4">Features</th>
                                    <th className="pb-3 font-medium px-4 text-center">Status</th>
                                    <th className="pb-3 font-medium px-4">Time Started</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={viewType === 'tasks' ? 8 : viewType === 'xp' ? 5 : 6} className="text-center py-8 text-zinc-500">
                                    No records found.
                                </td>
                            </tr>
                        ) : viewType === 'tasks' ? (
                            (paginatedItems as TaskRecord[]).map(task => (
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
                                    <td className="py-3 px-4 text-center text-xs">
                                        {task.completionType === 'BUDDY' ? (
                                            <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-medium">
                                                👥 1:1 ({task.completedWithBuddyName || 'Buddy'})
                                             </span>
                                        ) : task.completionType === 'ROOM' ? (
                                            <span className="bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-lg border border-teal-500/20 font-medium">
                                                🏫 Group ({task.completedInRoomName || 'Room'})
                                             </span>
                                        ) : (
                                            <span className="bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg border border-white/5 font-medium">
                                                👤 Solo
                                             </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right text-white font-medium">
                                        +{task.xpEarned}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-zinc-400">
                                        {(() => {
                                            try {
                                                const d = new Date(task.date);
                                                return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                                            } catch {
                                                return task.date;
                                            }
                                        })()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs ${task.status === 'Completed' ? 'text-green-400' : 'text-red-400'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : viewType === 'xp' ? (
                            (paginatedItems as any[]).map(record => (
                                <tr key={record.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4 text-white text-sm max-w-[250px] truncate">{record.activity}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-medium ${
                                            record.category === 'TASK' 
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                            {record.category === 'TASK' ? 'Task Completion' : 'Badge Reward'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-zinc-400 text-xs">{record.details}</td>
                                    <td className="py-3 px-4 text-right text-green-400 font-bold">
                                        +{record.xpGained} XP
                                    </td>
                                    <td className="py-3 px-4 text-xs text-zinc-400">
                                        {(() => {
                                            try {
                                                const d = new Date(record.date);
                                                return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                                            } catch {
                                                return record.date;
                                            }
                                        })()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            (paginatedItems as ReportRoom[]).map(room => (
                                <tr key={room.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4 text-white text-sm max-w-[200px] truncate">{room.name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            room.role === 'Host' 
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                            {room.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-zinc-200">
                                        {room.durationMinutes} mins
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {room.features.length === 0 ? (
                                                <span className="text-xs text-zinc-600">-</span>
                                            ) : (
                                                room.features.map(f => (
                                                    <span key={f} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5">
                                                        {f}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            room.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' :
                                            room.status === 'WAITING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-zinc-800 text-zinc-500 border border-white/5'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-zinc-400">
                                        {(() => {
                                            try {
                                                const d = new Date(room.date);
                                                return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                                            } catch {
                                                return room.date;
                                            }
                                        })()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/5">
                    <div className="text-sm text-zinc-400">
                        Showing <span className="font-semibold text-white">{Math.min(totalItems, (page - 1) * itemsPerPage + 1)}</span> to{' '}
                        <span className="font-semibold text-white">{Math.min(totalItems, page * itemsPerPage)}</span> of{' '}
                        <span className="font-semibold text-white">{totalItems}</span> items
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
