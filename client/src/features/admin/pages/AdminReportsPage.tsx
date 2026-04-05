import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader, Eye, X, UserCircle, Flag, MessageSquare, Video, Search, ChevronDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { chatApi, ReportStatus, ReportContext, ReportAction } from '../../chat/api/chatApi';

interface Report {
    id: string;
    reporterId: string;
    reporter?: { id: string; fullName: string; email: string; avatar?: string };
    reportedUserId: string;
    reportedUser?: { id: string; fullName: string; email: string; avatar?: string };
    context: ReportContext;
    reason: string;
    additionalDetails?: string;
    screenshots?: string[];
    status: ReportStatus;
    actionTaken?: ReportAction;
    adminNote?: string;
    createdAt: string;
}

export const AdminReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [resolutionAction, setResolutionAction] = useState<ReportAction>(ReportAction.NO_ACTION);
    const [adminNote, setAdminNote] = useState('');

    // Filters and Search
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 400);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.max(1, Number(searchParams.get('limit') ?? '10'));
    const statusFilter = (searchParams.get('status') ?? 'ALL') as 'ALL' | ReportStatus;

    const setPage = (v: number) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('page', String(v)); return n; });
    const setStatusFilter = (v: string) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('status', v); n.set('page', '1'); return n; });
    const setLimit = (v: number) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('limit', String(v)); n.set('page', '1'); return n; });

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await chatApi.getReports({
                page,
                limit,
                status: statusFilter === 'ALL' ? undefined : (statusFilter as ReportStatus),
                search: debouncedSearch.trim() || undefined
            });
            if (res.success) {
                setReports(res.data.reports);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('Failed to load reports.');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, statusFilter, debouncedSearch]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleResolve = async () => {
        if (!selectedReport) return;
        setIsResolving(true);
        try {
            // Determine status: if NO_ACTION then DISMISSED, else RESOLVED
            const status = resolutionAction === ReportAction.NO_ACTION 
                ? ReportStatus.DISMISSED 
                : ReportStatus.RESOLVED;

            const res = await chatApi.resolveReport(selectedReport.id, {
                status,
                actionTaken: resolutionAction,
                adminNote
            });
            if (res.success) {
                toast.success(`Report ${status.toLowerCase()} successfully`);
                setSelectedReport(null);
                fetchReports();
            } else {
                toast.error(res.message || 'Failed to resolve report');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error resolving report');
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Reports</h1>
                    <p className="text-[#A1A1AA] text-sm mt-1">{total} reports filed by users.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        <input
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#2563EB] transition-colors"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none w-full bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={ReportStatus.PENDING}>Pending Only</option>
                            <option value={ReportStatus.RESOLVED}>Resolved Only</option>
                            <option value={ReportStatus.DISMISSED}>Dismissed Only</option>
                        </select>
                        <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-[#2563EB]" size={28} />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                        <Flag size={32} className="mb-3 opacity-40 text-red-500" />
                        <p className="font-medium text-white">No reports found</p>
                        <p className="text-xs mt-1">Hooray! The community is clean.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#27272A] text-[#A1A1AA] text-left">
                                    <th className="px-6 py-4 font-semibold">Report ID</th>
                                    <th className="px-6 py-4 font-semibold">Reporter</th>
                                    <th className="px-6 py-4 font-semibold">Reported User</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-t border-[#27272A] hover:bg-[#1F1F23] transition-colors">
                                        <td className="px-6 py-4 font-mono text-zinc-300">
                                            #{report.id.slice(-5)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">
                                                {report.reporter?.fullName ?? `#${report.reporterId.slice(-8)}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">
                                                {report.reportedUser?.fullName ?? `#${report.reportedUserId.slice(-8)}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${report.context === 'CHAT' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {report.reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${report.status === ReportStatus.PENDING ? 'bg-amber-500/15 text-amber-400' : report.status === ReportStatus.RESOLVED ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#A1A1AA]">
                                            {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setResolutionAction(report.actionTaken || ReportAction.NO_ACTION);
                                                    setAdminNote(report.adminNote || '');
                                                }}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-sm text-zinc-500">
                    Showing <span className="text-white font-medium">{reports.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="text-white font-medium">{Math.min(page * limit, total)}</span> of <span className="text-white font-medium">{total}</span> reports
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            className="appearance-none bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 rounded-lg pl-2.5 pr-7 py-2 outline-none focus:border-[#2563EB] cursor-pointer"
                        >
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-bold text-white">
                            {page} / {Math.ceil(total / limit) || 1}
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= Math.ceil(total / limit)}
                            className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Details Modal ───────────────────────────────────────── */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-red-500/10">
                                    <Flag size={20} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Report Details</h3>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1F1F23]">
                                <UserCircle size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reported User</p>
                                    <p className="text-sm font-medium text-white break-all">
                                        {selectedReport.reportedUser?.fullName ?? selectedReport.reportedUserId}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1F1F23]">
                                <UserCircle size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reporter</p>
                                    <p className="text-sm font-medium text-zinc-400 break-all">
                                        {selectedReport.reporter?.fullName ?? selectedReport.reporterId}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[#1F1F23]">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Context</p>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${selectedReport.context === ReportContext.CHAT ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {selectedReport.context === ReportContext.CHAT ? <MessageSquare size={12} /> : <Video size={12} />}
                                        {selectedReport.context}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-[#1F1F23]">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Status</p>
                                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${selectedReport.status === ReportStatus.PENDING ? 'bg-amber-500/15 text-amber-400' : selectedReport.status === ReportStatus.RESOLVED ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {selectedReport.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                <p className="text-[10px] font-semibold text-red-500/70 uppercase tracking-wider mb-1">Reason for Report</p>
                                <p className="text-sm font-medium text-red-400">{selectedReport.reason}</p>
                                {selectedReport.additionalDetails && (
                                    <div className="mt-3 pt-3 border-t border-red-500/10">
                                        <p className="text-[10px] font-semibold text-red-500/50 uppercase tracking-wider mb-1">Additional Details</p>
                                        <p className="text-sm text-red-300/80 whitespace-pre-wrap">{selectedReport.additionalDetails}</p>
                                    </div>
                                )}
                            </div>

                            {/* Screenshots */}
                            {selectedReport.screenshots && selectedReport.screenshots.length > 0 && (
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-700/50">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Uploaded Screenshots ({selectedReport.screenshots.length})</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedReport.screenshots.map((url, idx) => (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative block aspect-video rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-all"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                    <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Open ↗</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedReport.status === ReportStatus.PENDING && (
                                <div className="pt-4 space-y-4 border-t border-[#27272A]">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Take Action</p>
                                        <select 
                                            value={resolutionAction}
                                            onChange={(e) => setResolutionAction(e.target.value as ReportAction)}
                                            className="w-full bg-[#1F1F23] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value={ReportAction.NO_ACTION}>Dismiss (No Action)</option>
                                            <option value={ReportAction.WARNING}>Issue Warning</option>
                                            {/* <option value={ReportAction.TEMPORARY_BLOCK}>Temporary Block</option>
                                            <option value={ReportAction.PERMANENT_BLOCK}>Permanent Block</option> */}
                                        </select>
                                    </div>
                                    {/* <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Admin Note</p>
                                        <textarea 
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Reason for this action..."
                                            className="w-full bg-[#1F1F23] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                                        />
                                    </div> */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleResolve}
                                            disabled={isResolving}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/10"
                                        >
                                            {isResolving ? 'Resolving...' : 'Submit Resolution'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedReport.status !== ReportStatus.PENDING && (
                                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Resolution Detail</p>
                                    <p className="text-sm font-medium text-emerald-400 mb-1">Action: {selectedReport.actionTaken}</p>
                                    {/* {selectedReport.adminNote && (
                                        <p className="text-sm text-zinc-400 italic">"{selectedReport.adminNote}"</p>
                                    )} */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
