import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  X, 
  Users, 
  Zap, 
  UserPlus, 
  IndianRupee,
  Copy,
  CheckCircle2,
  Calendar,
  CreditCard,
  UserCircle,
  Mail,
  Shield
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

interface SubscriptionStats {
  totalUsers:     number;
  premiumCount:   number;
  freeCount:      number;
  cancelledCount: number;
  expiredCount:   number;
  monthlyRevenue: number;
}

interface AdminSubscription {
  _id: string;
  userId: string;
  plan: 'FREE' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  user: {
    id:        string;
    fullName:  string;
    email:     string;
    username:  string;
    createdAt: string;
  };
}

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? '10'));
  const planFilter = (searchParams.get('plan') ?? 'all').toUpperCase();
  const statusFilter = (searchParams.get('status') ?? 'all').toUpperCase();

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await ProTimeBackend.get(API_ROUTES.ADMIN_SUBSCRIPTION_STATS);
      setStats(res.data?.data);
    } catch {
      toast.error('Failed to load subscription stats.');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        plan: planFilter,
        status: statusFilter,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      const res = await ProTimeBackend.get(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}?${params}`);
      setSubscriptions(res.data?.data?.subscriptions ?? []);
      setTotal(res.data?.data?.total ?? 0);
    } catch {
      toast.error('Failed to load subscriptions.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, planFilter, statusFilter, debouncedSearch]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Stripe ID copied!');
  };

  const setPage = (v: number) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('page', String(v)); return n; });
  const setLimit = (v: number) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('limit', String(v)); n.set('page', '1'); return n; });
  const setPlan = (v: string) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('plan', v.toLowerCase()); n.set('page', '1'); return n; });
  const setStatus = (v: string) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('status', v.toLowerCase()); n.set('page', '1'); return n; });

  const totalPages = Math.ceil(total / limit);

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
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">Overview of platform revenue and active plans.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Users" 
          value={stats?.totalUsers ?? 0}
          icon={<Users size={20} />}
          loading={isStatsLoading}
          color="blue"
        />
        <SummaryCard 
          title="Premium Users" 
          value={stats?.premiumCount ?? 0}
          detail={`${stats ? ((stats.premiumCount / (stats.totalUsers || 1)) * 100).toFixed(1) : 0}%`}
          icon={<Zap size={20} />}
          loading={isStatsLoading}
          color="purple"
        />
        <SummaryCard 
          title="Free Users" 
          value={stats?.freeCount ?? 0}
          detail={`${stats ? ((stats.freeCount / (stats.totalUsers || 1)) * 100).toFixed(1) : 0}%`}
          icon={<UserPlus size={20} />}
          loading={isStatsLoading}
          color="zinc"
        />
        <SummaryCard 
          title="Monthly Rev" 
          value={`₹${stats?.monthlyRevenue.toLocaleString() ?? '0'}`}
          detail={`${stats?.premiumCount ?? 0} × ₹499`}
          icon={<IndianRupee size={20} />}
          loading={isStatsLoading}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#2563EB] transition-colors"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={planFilter.toLowerCase()}
            onChange={e => setPlan(e.target.value)}
            className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="free">FREE</option>
            <option value="premium">PREMIUM</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter.toLowerCase()}
            onChange={e => setStatus(e.target.value)}
            className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">ACTIVE</option>
            <option value="cancelled">CANCELLED</option>
            <option value="expired">EXPIRED</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-[#2563EB]" size={28} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
            <CreditCard size={32} className="mb-3 opacity-40" />
            <p className="font-medium text-sm">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[#A1A1AA]">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Stripe ID</th>
                  <th className="px-6 py-4 font-semibold">Period</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-[#1F1F23]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white group-hover:text-[#2563EB] transition-colors">{sub.user.fullName}</span>
                        <span className="text-[#A1A1AA] text-xs mt-0.5">{sub.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PlanBadge plan={sub.plan} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4">
                      {sub.stripeSubscriptionId ? (
                        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                          <span className="truncate max-w-[100px]">{sub.stripeSubscriptionId}</span>
                          <button 
                            onClick={() => handleCopy(sub.stripeSubscriptionId!)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === sub.stripeSubscriptionId ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-[#A1A1AA]">
                        <div className="flex items-center gap-1.5" title="Start Date">
                          <Calendar size={10} />
                          <span>{new Date(sub.currentPeriodStart).toLocaleDateString()}</span>
                        </div>
                        {sub.plan === 'PREMIUM' ? (
                          <div className="flex items-center gap-1.5 mt-1" title="End Date">
                            <CreditCard size={10} />
                            <span className={new Date(sub.currentPeriodEnd) < new Date() ? 'text-red-400' : ''}>
                              {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-1 text-zinc-600 italic">
                            <div className="w-2.5" /> {/* Spacer to align with icons */}
                            <span>Lifetime access</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                      >
                        <Eye size={13} /> View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-zinc-500">
          {total > 0 && (
            <>
              Showing <span className="text-zinc-300 font-medium">{(page - 1) * limit + 1}</span> to <span className="text-zinc-300 font-medium">{Math.min(page * limit, total)}</span> of <span className="text-zinc-300 font-medium">{total}</span> subscriptions
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative mr-2">
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="appearance-none bg-[#18181B] border border-[#27272A] text-xs text-zinc-400 rounded-lg pl-2 pr-7 py-1.5 outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((pg, i) => (
                  pg === '...' ? (
                    <span key={`gap-${i}`} className="text-zinc-600 text-xs px-1">...</span>
                  ) : (
                    <button
                      key={pg}
                      onClick={() => setPage(pg as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        page === pg ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-zinc-800 border border-transparent hover:border-[#27272A]'
                      }`}
                    >
                      {pg}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Modal ───────────────────────────────────────── */}
      {selectedSub && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSub(null)}
        >
          <div
            className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10">
                  <UserCircle size={20} className="text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-bold text-white">Full Details</h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail Rows */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1F1F23]">
                <UserCircle size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">User Profile</p>
                  <p className="text-sm font-bold text-white">{selectedSub.user.fullName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">@{selectedSub.user.username}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1F1F23]">
                <Mail size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Contact Email</p>
                  <p className="text-sm text-zinc-200">{selectedSub.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-[#1F1F23]">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Current Plan</p>
                  <PlanBadge plan={selectedSub.plan} />
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-[#1F1F23]">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedSub.status} />
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1F1F23]">
                <Shield size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Stripe Subscription ID</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-mono text-zinc-300 truncate max-w-[200px]">{selectedSub.stripeSubscriptionId || 'N/A'}</p>
                    {selectedSub.stripeSubscriptionId && (
                      <button 
                        onClick={() => handleCopy(selectedSub.stripeSubscriptionId!)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {copiedId === selectedSub.stripeSubscriptionId ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1F1F23]">
                  <Calendar size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Joined Platform</p>
                    <p className="text-xs text-zinc-200">{new Date(selectedSub.user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1F1F23]">
                  <CreditCard size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Period Start</p>
                    <p className="text-xs text-zinc-200">{new Date(selectedSub.currentPeriodStart).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedSub.plan === 'PREMIUM' && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-purple-400" />
                    <span className="text-xs font-semibold text-purple-200 uppercase tracking-wide">Next Billing Date</span>
                  </div>
                  <span className="text-xs font-bold text-white">{new Date(selectedSub.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, detail, icon, loading, color }: { title: string, value: string | number, detail?: string, icon: React.ReactNode, loading: boolean, color: string }) => {
  const colors: Record<string, string> = {
    blue:   'from-blue-500/20 to-transparent text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/20 to-transparent text-purple-400 border-purple-500/20',
    green:  'from-green-500/20 to-transparent text-green-400 border-green-500/20',
    zinc:   'from-zinc-500/20 to-transparent text-zinc-400 border-zinc-500/20'
  };

  return (
    <div className={`bg-[#18181B] border rounded-2xl p-5 relative overflow-hidden transition-all hover:scale-[1.02] ${colors[color] || colors.zinc}`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          )}
          {detail && !loading && (
            <p className="text-[11px] font-medium text-zinc-500 mt-1 flex items-center gap-1">
              {detail}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-black/20 ${colors[color].split(' ')[1]}`}>
          {icon}
        </div>
      </div>
      <div className={`absolute -right-2 -bottom-2 opacity-5 scale-150`}>
        {icon}
      </div>
    </div>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  if (plan === 'PREMIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/10">
        <Zap size={10} fill="currentColor" />
        PREMIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
      FREE
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE:    'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/10',
    CANCELLED: 'bg-orange-500/10 text-orange-400 border-orange-500/10',
    EXPIRED:   'bg-red-500/10 text-red-400 border-red-500/10'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.ACTIVE}`}>
      {status}
    </span>
  );
};
