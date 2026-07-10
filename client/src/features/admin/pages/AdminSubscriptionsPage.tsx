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
  Shield,
  Trash2,
  Edit2,
  Plus,
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

// ── Utility badge components ─────────────────────────────────────────────────
const PlanBadge = ({ plan }: { plan: string }) => {
  if (plan === 'FREE') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
        FREE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/10">
      <Zap size={10} fill="currentColor" />
      {plan}
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
            <p className="text-[11px] font-medium text-zinc-500 mt-1">{detail}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-black/20`}>{icon}</div>
      </div>
      <div className="absolute -right-2 -bottom-2 opacity-5 scale-150">{icon}</div>
    </div>
  );
};


// ── Main Page ─────────────────────────────────────────────────────────────────
export const AdminSubscriptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');
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

  // Dynamic Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  // Plan Form states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    code: '',
    price: 0,
    featuresString: '',
    isActive: true,
  });

  // User Subscription Form states
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [subForm, setSubForm] = useState({
    userId: '',
    plan: '',
    status: 'ACTIVE',
    currentPeriodEnd: '',
  });

  const fetchPlans = async () => {
    setIsPlansLoading(true);
    try {
      const res = await ProTimeBackend.get('/admin/subscriptions/plans');
      setPlans(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load plans list.');
    } finally {
      setIsPlansLoading(false);
    }
  };

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

  useEffect(() => { fetchStats(); fetchPlans(); }, []);
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

  // ─── Plan CRUD handlers ────────────────────────────────────────────────────
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return toast.error('Plan name is required');
    if (!planForm.code.trim()) return toast.error('Plan code is required');

    const keyRegex = /^[A-Z0-9_]+$/;
    if (!keyRegex.test(planForm.code.toUpperCase())) {
      return toast.error('Plan code must be uppercase alphanumeric and underscores only');
    }

    try {
      const payload = {
        name: planForm.name.trim(),
        code: planForm.code.toUpperCase().trim(),
        price: Number(planForm.price) || 0,
        features: planForm.featuresString.split('\n').map(f => f.trim()).filter(Boolean),
        isActive: planForm.isActive,
      };

      if (editingPlan) {
        await ProTimeBackend.put(`/admin/subscriptions/plans/${editingPlan._id}`, payload);
        toast.success('Plan updated successfully');
      } else {
        await ProTimeBackend.post('/admin/subscriptions/plans', payload);
        toast.success('Plan created successfully');
      }
      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = (planId: string, planName: string, planCode: string) => {
    if (planCode === 'FREE' || planCode === 'PREMIUM') {
      toast.error('Default FREE and PREMIUM plans cannot be deleted.');
      return;
    }
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-white">Delete <span className="text-red-400">{planName}</span> plan?</p>
          <p className="text-xs text-zinc-400">This will permanently remove the plan definition.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await ProTimeBackend.delete(`/admin/subscriptions/plans/${planId}`);
                  toast.success('Plan deleted successfully');
                  fetchPlans();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to delete plan');
                }
              }}
              className="flex-1 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        style: {
          background: '#18181B',
          border: '1px solid #3F3F46',
          borderRadius: '14px',
          padding: '16px',
          minWidth: '260px',
        },
      }
    );
  };

  // ─── User Subscription CRUD handlers ───────────────────────────────────────
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.userId.trim()) return toast.error('User ID is required');
    if (!subForm.plan) return toast.error('Plan selection is required');

    try {
      const payload = {
        userId: subForm.userId.trim(),
        plan: subForm.plan,
        status: subForm.status,
        currentPeriodEnd: subForm.currentPeriodEnd ? new Date(subForm.currentPeriodEnd) : undefined,
      };

      if (editingSub) {
        await ProTimeBackend.patch(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${subForm.userId}`, payload);
        toast.success('Subscription updated successfully');
      } else {
        await ProTimeBackend.post(API_ROUTES.ADMIN_SUBSCRIPTION_ADD, payload);
        toast.success('Subscription assigned successfully');
      }
      setIsSubModalOpen(false);
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subscription');
    }
  };

  const handleDeleteSubscription = (userId: string, userName: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-white">Reset <span className="text-purple-400">{userName}</span>'s subscription?</p>
          <p className="text-xs text-zinc-400">This will delete their paid subscription record and reset their plan back to FREE.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await ProTimeBackend.delete(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${userId}`);
                  toast.success('Subscription deleted successfully');
                  fetchSubscriptions();
                  fetchStats();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to delete subscription');
                }
              }}
              className="flex-1 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-all"
            >
              Reset to FREE
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        style: {
          background: '#18181B',
          border: '1px solid #3F3F46',
          borderRadius: '14px',
          padding: '16px',
          minWidth: '280px',
        },
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">Overview of platform revenue and active plans.</p>
        </div>
        {activeTab === 'subscriptions' ? (
          <button
            onClick={() => {
              setEditingSub(null);
              setSubForm({ userId: '', plan: plans[0]?.code || 'FREE', status: 'ACTIVE', currentPeriodEnd: '' });
              setIsSubModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 cursor-pointer"
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">Assign Subscription</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingPlan(null);
              setPlanForm({ name: '', code: '', price: 0, featuresString: '', isActive: true });
              setIsPlanModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 cursor-pointer"
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">Add New Plan</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-4 border-b border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'subscriptions'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-zinc-700'
          }`}
        >
          <CreditCard size={14} />
          User Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'plans'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-zinc-700'
          }`}
        >
          <Zap size={14} />
          Manage Plans
        </button>
      </div>

      {activeTab === 'subscriptions' && (
        <>
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
                className="appearance-none bg-[#18181B] border border-[#27272A] text-sm text-white rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#2563EB] cursor-pointer uppercase"
              >
                <option value="all">All Plans</option>
                {plans.map(p => (
                  <option key={p.code} value={p.code.toLowerCase()}>{p.code}</option>
                ))}
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
                    <tr className="bg-[#0D0D10] text-[#A1A1AA] border-b border-[#27272A] text-xs uppercase font-semibold">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Current Plan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Stripe Sub ID</th>
                      <th className="px-6 py-4">Access Period</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] text-zinc-300">
                    {subscriptions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-sm shrink-0 uppercase">
                              {sub.user.fullName.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate max-w-[150px]">{sub.user.fullName}</p>
                              <p className="text-xs text-zinc-500 truncate max-w-[150px]">@{sub.user.username}</p>
                            </div>
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
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <span className="font-mono truncate max-w-[100px]">{sub.stripeSubscriptionId}</span>
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
                            {sub.plan !== 'FREE' ? (
                              <div className="flex items-center gap-1.5 mt-1" title="End Date">
                                <CreditCard size={10} />
                                <span className={new Date(sub.currentPeriodEnd) < new Date() ? 'text-red-400' : ''}>
                                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-1 text-zinc-600 italic">
                                <div className="w-2.5" />
                                <span>Lifetime access</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedSub(sub)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                              title="View details"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSub(sub);
                                setSubForm({
                                  userId: sub.userId,
                                  plan: sub.plan,
                                  status: sub.status,
                                  currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString().slice(0, 10) : '',
                                });
                                setIsSubModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                              title="Edit user plan"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(sub.userId, sub.user.fullName)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer disabled:opacity-30 border border-transparent hover:border-red-500/20"
                              title="Reset user to FREE"
                              disabled={sub.plan === 'FREE'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center text-sm text-zinc-400 px-1 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Rows per page:</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                  className="appearance-none bg-[#18181B] border border-[#27272A] text-xs text-white rounded-lg pl-2 pr-7 py-1 outline-none cursor-pointer focus:border-[#2563EB]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
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
        </>
      )}

      {activeTab === 'plans' && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-sm">
          {isPlansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-[#2563EB]" size={28} />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
              <Zap size={32} className="mb-3 opacity-40" />
              <p className="font-medium text-sm">No plans found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#0D0D10] text-[#A1A1AA] border-b border-[#27272A] text-xs uppercase font-semibold">
                    <th className="px-6 py-4">Plan Name</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Monthly Price</th>
                    <th className="px-6 py-4">Features</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] text-zinc-300">
                  {plans.map((p) => (
                    <tr key={p._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                          {p.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {p.price === 0 ? 'FREE' : `₹${p.price.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-zinc-400 truncate" title={p.features.join(', ')}>
                          {p.features.length > 0 ? p.features.join(', ') : 'No custom features'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                            : 'bg-red-500/10 text-red-400 border-red-500/10'
                        }`}>
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingPlan(p);
                              setPlanForm({
                                name: p.name,
                                code: p.code,
                                price: p.price,
                                featuresString: p.features.join('\n'),
                                isActive: p.isActive,
                              });
                              setIsPlanModalOpen(true);
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-[#2563EB]/20 border border-zinc-700 hover:border-[#2563EB]/40 rounded-lg text-zinc-300 hover:text-[#2563EB] transition-all cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(p._id, p.name, p.code)}
                            className="p-1.5 bg-zinc-800 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-lg text-zinc-300 hover:text-red-400 transition-all cursor-pointer disabled:opacity-30"
                            title="Delete Plan"
                            disabled={p.code === 'FREE' || p.code === 'PREMIUM'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── View Detail Modal ───────────────────────────────────────── */}
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
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
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
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
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

              {selectedSub.plan !== 'FREE' && (() => {
                const periodEnd = new Date(selectedSub.currentPeriodEnd);
                const isExpired = periodEnd < new Date();
                let label = 'Next Billing Date';
                if (selectedSub.status === 'CANCELLED') label = 'Premium Access Until';
                if (selectedSub.status === 'EXPIRED' || isExpired) label = 'Expired On';
                return (
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${
                    isExpired
                      ? 'bg-red-500/10 border-red-500/20'
                      : selectedSub.status === 'CANCELLED'
                        ? 'bg-orange-500/10 border-orange-500/20'
                        : 'bg-[rgb(168,85,247,0.1)] border-[rgba(168,85,247,0.2)]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Zap size={16} className={isExpired ? 'text-red-400' : selectedSub.status === 'CANCELLED' ? 'text-orange-400' : 'text-purple-400'} />
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                        isExpired ? 'text-red-300' : selectedSub.status === 'CANCELLED' ? 'text-orange-200' : 'text-purple-200'
                      }`}>{label}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-bold text-white">{periodEnd.toLocaleDateString()}</span>
                      {isExpired && selectedSub.status === 'ACTIVE' && (
                        <span className="text-[10px] text-red-400 font-semibold">⚠ Stale — webhook missed</span>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Plan Modal ─────────────────────────────────────── */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSavePlan}
            className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">
                {editingPlan ? 'Edit Subscription Plan' : 'Add New Plan'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Plan Name</label>
              <input
                type="text"
                value={planForm.name}
                onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g. Pro Monthly"
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Plan Code (Uppercase Unique ID)</label>
              <input
                type="text"
                value={planForm.code}
                onChange={e => setPlanForm({ ...planForm, code: e.target.value })}
                placeholder="e.g. PRO"
                disabled={!!editingPlan && (editingPlan.code === 'FREE' || editingPlan.code === 'PREMIUM')}
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors uppercase disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Monthly Price (INR)</label>
              <input
                type="number"
                value={planForm.price}
                onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                placeholder="e.g. 799"
                disabled={!!editingPlan && editingPlan.code === 'FREE'}
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors disabled:opacity-50"
                required
                min={0}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Features (one per line)</label>
              <textarea
                value={planForm.featuresString}
                onChange={e => setPlanForm({ ...planForm, featuresString: e.target.value })}
                placeholder="Unlimited buddy match&#10;Unlimited study rooms"
                rows={4}
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="plan_active_chk"
                checked={planForm.isActive}
                onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })}
                className="rounded text-[#2563EB] focus:ring-0 bg-[#1F1F23] border-[#27272A] cursor-pointer"
              />
              <label htmlFor="plan_active_chk" className="text-sm text-zinc-300 cursor-pointer select-none">
                This plan is active and available
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-600 transition-colors text-sm font-semibold cursor-pointer"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Add/Edit User Subscription Modal ────────────────────────── */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveSubscription}
            className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">
                {editingSub ? 'Update User Subscription' : 'Assign User Subscription'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">User ID</label>
              <input
                type="text"
                value={subForm.userId}
                onChange={e => setSubForm({ ...subForm, userId: e.target.value })}
                placeholder="User's MongoDB Object ID"
                disabled={!!editingSub}
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Select Plan</label>
              <div className="relative">
                <select
                  value={subForm.plan}
                  onChange={e => setSubForm({ ...subForm, plan: e.target.value })}
                  className="w-full appearance-none bg-[#1F1F23] border border-[#27272A] text-sm text-white rounded-xl px-3.5 py-2 outline-none focus:border-[#2563EB] cursor-pointer uppercase"
                  required
                >
                  {plans.map(p => (
                    <option key={p.code} value={p.code}>{p.code}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Status</label>
              <div className="relative">
                <select
                  value={subForm.status}
                  onChange={e => setSubForm({ ...subForm, status: e.target.value })}
                  className="w-full appearance-none bg-[#1F1F23] border border-[#27272A] text-sm text-white rounded-xl px-3.5 py-2 outline-none focus:border-[#2563EB] cursor-pointer"
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Period End Date (Expiry)</label>
              <input
                type="date"
                value={subForm.currentPeriodEnd}
                onChange={e => setSubForm({ ...subForm, currentPeriodEnd: e.target.value })}
                className="w-full bg-[#1F1F23] border border-[#27272A] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#2563EB] transition-colors"
                disabled={subForm.plan === 'FREE'}
                required={subForm.plan !== 'FREE'}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-600 transition-colors text-sm font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
