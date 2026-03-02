import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Shield, ShieldOff, Loader, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, Eye, X, Mail, Calendar, UserCircle } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../config/env';
import toast from 'react-hot-toast';

interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isBlocked: boolean;
    createdAt: string;
    subscription?: 'free' | 'premium';
}

interface ConfirmDialog {
    open: boolean;
    userId: string;
    userName: string;
    action: 'block' | 'unblock';
}

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 400);

    // ── All filters + page live in the URL (survives refresh) ────────────────
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.max(1, Number(searchParams.get('limit') ?? '10'));
    const status = (searchParams.get('status') ?? 'all') as 'all' | 'blocked' | 'unblocked';
    const sort = (searchParams.get('sort') ?? 'new') as 'new' | 'old' | 'name' | 'name-desc';
    const subscription = (searchParams.get('sub') ?? 'all') as 'all' | 'free' | 'premium';

    const setPage = (v: number) =>
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('page', String(v)); return n; });
    const setLimit = (v: number) =>
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('limit', String(v)); n.set('page', '1'); return n; });
    const setStatus = (v: typeof status) =>
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('status', v); n.set('page', '1'); return n; });
    const setSort = (v: typeof sort) =>
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('sort', v); n.set('page', '1'); return n; });
    const setSubscription = (v: typeof subscription) =>
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('sub', v); n.set('page', '1'); return n; });

    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<ConfirmDialog>({ open: false, userId: '', userName: '', action: 'block' });
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const sortField = (sort === 'name' || sort === 'name-desc') ? 'fullName' : 'createdAt';
            const sortOrder = sort === 'old' ? 'asc' : sort === 'name' ? 'asc' : 'desc';
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                status,
                sort: sortField,
                order: sortOrder,
                ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
            });
            const res = await ProTimeBackend.get(`${API_ROUTES.ADMIN_USERS}?${params}`);
            setUsers(res.data?.data?.users ?? []);
            setTotal(res.data?.data?.total ?? 0);
        } catch {
            toast.error('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, status, sort]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openConfirm = (user: AdminUser) => {
        setConfirm({ open: true, userId: user.id, userName: user.fullName, action: user.isBlocked ? 'unblock' : 'block' });
    };

    const handleConfirm = async () => {
        const { userId, action } = confirm;
        setConfirm(c => ({ ...c, open: false }));
        setActionLoading(userId);
        try {
            const url = action === 'block' ? API_ROUTES.ADMIN_BLOCK_USER(userId) : API_ROUTES.ADMIN_UNBLOCK_USER(userId);
            await ProTimeBackend.patch(url);
            toast.success(`User ${action === 'block' ? 'blocked' : 'unblocked'} successfully.`);
            fetchUsers();
        } catch {
            toast.error('Action failed. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    // Client-side subscription filter (backend doesn't have this field yet)
    const displayedUsers = subscription === 'all'
        ? users
        : users.filter(u => (u.subscription ?? 'free') === subscription);

    // Build page number buttons (max 7 visible with ellipsis)
    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [1];
        if (page > 3) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-[#A1A1AA] text-sm mt-1">{total} users registered on ProTime.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {/* Search input with debounce */}
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

                {/* Subscription filter */}
                <div className="relative">
                    <select
                        value={subscription}
                        onChange={e => setSubscription(e.target.value as typeof subscription)}
                        className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                        <option value="all">All Plans</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>

                {/* Status filter */}
                <div className="relative">
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as typeof status)}
                        className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="unblocked">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>

                {/* Sort filter */}
                <div className="relative">
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value as typeof sort)}
                        className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                        <option value="new">Newest First</option>
                        <option value="old">Oldest First</option>
                        <option value="name">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-[#2563EB]" size={28} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                        <Search size={32} className="mb-3 opacity-40" />
                        <p className="font-medium">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#27272A] text-[#A1A1AA] text-left">
                                    <th className="px-4 py-4 font-semibold w-12 text-center">#</th>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Subscription</th>
                                    <th className="px-6 py-4 font-semibold">Joined</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user, i) => (
                                    <tr key={user.id} className={`border-t border-[#27272A] hover:bg-[#1F1F23] transition-colors ${i === 0 ? 'border-t-0' : ''}`}>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-xs font-mono font-bold text-zinc-500">{(page - 1) * limit + i + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-white">{user.fullName}</p>
                                            <p className="text-[#A1A1AA] text-xs mt-0.5">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(user.subscription ?? 'free') === 'premium'
                                                ? 'bg-amber-500/15 text-amber-400'
                                                : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {(user.subscription ?? 'free') === 'premium' ? '⭐ Premium' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#A1A1AA]">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-[#22C55E]/10 text-[#22C55E]'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                                            >
                                                <Eye size={13} /> View Details
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openConfirm(user)}
                                                disabled={!!actionLoading}
                                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 ${user.isBlocked
                                                    ? 'bg-[#22C55E] text-white hover:bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                                                    : 'bg-[#9e1910] text-white hover:bg-[#b81f15] shadow-[0_0_12px_rgba(158,25,16,0.3)]'
                                                    }`}
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader size={12} className="animate-spin" />
                                                ) : user.isBlocked ? (
                                                    <><ShieldOff size={13} /> Unblock</>
                                                ) : (
                                                    <><Shield size={13} /> Block</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Pagination Footer ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">

                {/* Left: results summary */}
                <div className="text-sm text-zinc-400">
                    {total === 0 ? 'No results' : (
                        <>
                            Showing{' '}
                            <span className="font-semibold text-white">{(page - 1) * limit + 1}</span>
                            {'–'}
                            <span className="font-semibold text-white">{Math.min(page * limit, total)}</span>
                            {' of '}
                            <span className="font-semibold text-white">{total}</span>
                            {' results • Page '}
                            <span className="font-semibold text-white">{page}</span>
                            {' of '}
                            <span className="font-semibold text-white">{totalPages}</span>
                        </>
                    )}
                </div>

                {/* Right: per-page picker + page buttons */}
                <div className="flex items-center gap-2">
                    {/* Per-page picker */}
                    <div className="relative">
                        <select
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            className="appearance-none bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 rounded-lg pl-2.5 pr-7 py-2 outline-none focus:border-[#2563EB] cursor-pointer"
                        >
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Page navigation */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                            >
                                <ChevronLeft size={13} /> Prev
                            </button>

                            {getPageNumbers().map((pg, idx) =>
                                pg === '...'
                                    ? <span key={`e-${idx}`} className="px-1 text-zinc-600 text-xs select-none">…</span>
                                    : <button
                                        key={pg}
                                        onClick={() => setPage(pg as number)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === pg
                                            ? 'bg-[#2563EB] text-white'
                                            : 'bg-[#18181B] border border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        {pg}
                                    </button>
                            )}

                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                            >
                                Next <ChevronRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirm.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-red-500/10">
                                <AlertTriangle size={20} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white capitalize">{confirm.action} User</h3>
                        </div>
                        <p className="text-[#A1A1AA] text-sm mb-6">
                            Are you sure you want to <strong className="text-white">{confirm.action}</strong>{' '}
                            <strong className="text-white">{confirm.userName}</strong>?
                            {confirm.action === 'block' && ' They will not be able to access the platform.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirm(c => ({ ...c, open: false }))}
                                className="flex-1 py-2.5 rounded-xl border border-[#27272A] text-zinc-300 hover:bg-zinc-800 text-sm font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${confirm.action === 'block' ? 'bg-red-500 hover:bg-red-400' : 'bg-[#22C55E] hover:bg-green-400'
                                    }`}
                            >
                                Yes, {confirm.action}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── User Details Modal ───────────────────────────────────────── */}
            {selectedUser && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#2563EB]/10">
                                    <UserCircle size={20} className="text-[#2563EB]" />
                                </div>
                                <h3 className="text-lg font-bold text-white">User Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Detail Rows */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                <UserCircle size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Full Name</p>
                                    <p className="text-sm font-semibold text-white">{selectedUser.fullName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                <Mail size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-sm text-zinc-200">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                    <Shield size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Role</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedUser.role === 'ADMIN' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-zinc-800 text-zinc-300'
                                            }`}>{selectedUser.role}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selectedUser.isBlocked ? 'bg-red-500' : 'bg-[#22C55E]'}`} />
                                    <div>
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedUser.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-[#22C55E]/10 text-[#22C55E]'
                                            }`}>{selectedUser.isBlocked ? 'Blocked' : 'Active'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${(selectedUser.subscription ?? 'free') === 'premium' ? 'bg-amber-400' : 'bg-zinc-500'
                                    }`} />
                                <div>
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Subscription</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(selectedUser.subscription ?? 'free') === 'premium'
                                        ? 'bg-amber-500/15 text-amber-400'
                                        : 'bg-zinc-800 text-zinc-300'
                                        }`}>
                                        {(selectedUser.subscription ?? 'free') === 'premium' ? '⭐ Premium' : 'Free'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1F1F23]">
                                <Calendar size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Joined</p>
                                    <p className="text-sm text-zinc-200">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
