import React, { useEffect, useState, useCallback } from 'react';
import { Loader, Eye, X, UserCircle, Flag, MessageSquare, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi, ReportStatus, ReportContext, ReportAction } from '../../chat/api/chatApi';

interface Report {
    id: string;
    reporterId: string;
    reportedUserId: string;
    context: ReportContext;
    reason: string;
    additionalDetails?: string;
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

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await chatApi.getReports();
            if (res.success) {
                setReports(res.data.reports);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('Failed to load reports.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleResolve = async () => {
        if (!selectedReport) return;
        setIsResolving(true);
        try {
            const res = await chatApi.resolveReport(selectedReport.id, {
                action: resolutionAction,
                adminNote
            });
            if (res.success) {
                toast.success('Report resolved successfully');
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
            <div>
                <h1 className="text-2xl font-bold text-white">User Reports</h1>
                <p className="text-[#A1A1AA] text-sm mt-1">{total} reports filed by users.</p>
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
                                    <th className="px-6 py-4 font-semibold">Reported User ID</th>
                                    <th className="px-6 py-4 font-semibold">Context</th>
                                    <th className="px-6 py-4 font-semibold">Reason</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-t border-[#27272A] hover:bg-[#1F1F23] transition-colors">
                                        <td className="px-6 py-4 font-mono text-zinc-300">
                                            {report.reportedUserId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${report.context === ReportContext.CHAT ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {report.context === ReportContext.CHAT ? <MessageSquare size={12} /> : <Video size={12} />}
                                                {report.context}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{report.reason}</span>
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

            {/* ─── Details Modal ───────────────────────────────────────── */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
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
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reported User ID</p>
                                    <p className="text-sm font-mono text-white break-all">{selectedReport.reportedUserId}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1F1F23]">
                                <UserCircle size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reporter ID</p>
                                    <p className="text-sm font-mono text-zinc-400 break-all">{selectedReport.reporterId}</p>
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

                            {/* Resolution Form */}
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
                                            <option value={ReportAction.TEMPORARY_BLOCK}>Temporary Block</option>
                                            <option value={ReportAction.PERMANENT_BLOCK}>Permanent Block</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Admin Note</p>
                                        <textarea 
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Reason for this action..."
                                            className="w-full bg-[#1F1F23] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                                        />
                                    </div>
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
                                    {selectedReport.adminNote && (
                                        <p className="text-sm text-zinc-400 italic">"{selectedReport.adminNote}"</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
