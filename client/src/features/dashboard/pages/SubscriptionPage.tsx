import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Check, Loader2, Crown, Shield, Zap, Calendar,
    Clock, Bot, Star, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { subscriptionService } from '../api/subscription-service';
import type { SubscriptionResponse } from '../api/subscription-service';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateUser } from '../../auth/store/authSlice';

const FREE_FEATURES = [
    'Unlimited Todos & Pomodoro',
    '5 Buddy Matches per month',
    '3 Group Room joins per month',
    '10 Community Chats per day',
    'Level Cap: Level 6 (Learner)',
    '30 AI Tokens per month',
    'View Monthly Reports',
];

const PREMIUM_FEATURES = [
    'Everything in Free Plan',
    'Unlimited Buddy Matches & Rooms',
    'Create your own Study Rooms',
    'Unlimited Community Chat',
    'Level Cap: Level 20 (Master)',
    '100 AI Tokens per day',
    'Download Monthly Reports',
    'Premium Badges & Advanced Filters',
    'Bonus Streak XP Rewards',
];

function fmt(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

export const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(state => state.auth.user);
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const data = await subscriptionService.getSubscription();
                setSubscription(data);
                if (data && data.isPremium !== authUser?.isPremium) {
                    dispatch(updateUser({ isPremium: data.isPremium }));
                }
            } catch (error) {
                console.error('Failed to fetch subscription', error);
                toast.error('Could not load subscription details');
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    // Show success banner if redirected from payment
    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            toast.success('🎉 Welcome to ProTime Premium!', { duration: 5000 });
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[blueviolet]" />
            </div>
        );
    }

    const isPremium = subscription?.isPremium ?? false;
    const daysLeft = subscription?.daysRemaining ?? 0;
    const aiUsed = subscription?.aiUsageCount ?? 0;
    const aiMax = isPremium ? 100 : 30;
    const aiRemaining = Math.max(0, aiMax - aiUsed);
    const aiLimitReached = aiUsed >= aiMax;
    const aiPct = Math.min(100, Math.round((aiUsed / aiMax) * 100));

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">

            {/* ── Back link ── */}
            <Link
                to={ROUTES.USER_PROFILE}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
                <ArrowLeft size={15} />
                <span>Back to Profile</span>
            </Link>

            {/* ── Page heading ── */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Subscription</h1>
                <p className="text-zinc-400">
                    {isPremium
                        ? 'You\'re on ProTime Premium — enjoying the full experience.'
                        : 'You\'re on the Free plan. Upgrade anytime to unlock more.'}
                </p>
            </div>

            {/* ══════════════════════════════════════════════════════
                  SECTION 1 — CURRENT PLAN SUMMARY (always visible)
            ══════════════════════════════════════════════════════ */}
            <div className={`rounded-3xl p-8 border relative overflow-hidden ${
                isPremium
                    ? 'bg-gradient-to-br from-[#651ea6] via-[#7c2ae8] to-[#4B0082] border-purple-500/30'
                    : 'bg-zinc-900/60 border-white/10'
            }`}>
                {/* Glow decoration */}
                {isPremium && (
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${
                            isPremium ? 'bg-white/15' : 'bg-zinc-800'
                        }`}>
                            {isPremium
                                ? <Crown size={32} className="text-yellow-300" />
                                : <Shield size={32} className="text-zinc-400" />}
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                                isPremium ? 'text-yellow-300/80' : 'text-zinc-500'
                            }`}>
                                Current Plan
                            </p>
                            <h2 className={`text-2xl font-black ${isPremium ? 'text-white' : 'text-zinc-200'}`}>
                                {isPremium ? 'ProTime Premium' : 'Free Bird Plan'}
                            </h2>
                            <p className={`text-sm mt-0.5 ${isPremium ? 'text-purple-200' : 'text-zinc-500'}`}>
                                {isPremium ? '₹499 / month' : '₹0 / forever'}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm self-start sm:self-center ${
                        isPremium
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                        <CheckCircle2 size={16} />
                        {isPremium ? 'Active' : 'Free'}
                    </div>
                </div>

                {/* Premium expiry bar */}
                {isPremium && subscription?.currentPeriodEnd && (
                    <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-purple-200 font-medium flex items-center gap-1.5">
                                <Clock size={14} /> Next billing date
                            </span>
                            <span className="text-white font-bold">{fmt(subscription.currentPeriodEnd)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"
                                    style={{ width: `${Math.max(5, (daysLeft / 30) * 100)}%` }}
                                />
                            </div>
                            <span className="text-purple-200 text-xs font-bold whitespace-nowrap">
                                {daysLeft} days left
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════
                  SECTION 2 — SUBSCRIPTION DETAILS (all users)
            ══════════════════════════════════════════════════════ */}
            <div className="bg-zinc-900/60 rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-8 py-5 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Subscription Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                    {/* Plan */}
                    <div className="p-6 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Plan</p>
                        <p className="text-white font-bold text-lg">{isPremium ? 'ProTime Premium' : 'Free Bird'}</p>
                        <p className="text-zinc-500 text-xs">{isPremium ? '₹499 / month' : 'No charge'}</p>
                    </div>

                    {/* Status */}
                    <div className="p-6 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-zinc-500'}`} />
                            <p className={`font-bold text-lg ${isPremium ? 'text-green-400' : 'text-zinc-400'}`}>
                                {isPremium ? 'Active' : 'Free Tier'}
                            </p>
                        </div>
                        <p className="text-zinc-500 text-xs">
                            {isPremium ? 'Auto-renews monthly' : 'No expiry'}
                        </p>
                    </div>

                    {/* AI Tokens today */}
                    <div className="p-6 space-y-1 sm:col-span-2 lg:col-span-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Bot size={11} /> AI Tokens {isPremium ? 'Today' : 'This Month'}
                        </p>
                        <p className="text-white font-bold text-lg">{aiUsed} / {aiMax}</p>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    aiPct > 80 ? 'bg-red-500' : aiPct > 50 ? 'bg-yellow-400' : 'bg-[#8A2BE2]'
                                }`}
                                style={{ width: `${aiPct}%` }}
                            />
                        </div>
                        <p className={`text-xs font-medium ${aiLimitReached ? 'text-red-400' : 'text-zinc-500'}`}>
                            {aiLimitReached
                                ? `⚠ Limit reached — resets ${isPremium ? 'tomorrow' : 'next month'}`
                                : `${aiRemaining} tokens remaining ${isPremium ? 'today' : 'this month'}`}
                        </p>
                    </div>

                    {/* Period start */}
                    <div className="p-6 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Calendar size={11} /> Plan Start
                        </p>
                        <p className="text-white font-bold">
                            {isPremium && subscription?.currentPeriodStart
                                ? fmt(subscription.currentPeriodStart)
                                : 'Always Free'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                            {isPremium ? 'Current billing period' : 'No billing period'}
                        </p>
                    </div>

                    {/* Next billing / expiry */}
                    <div className="p-6 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Clock size={11} /> {isPremium ? 'Next Billing' : 'Expires'}
                        </p>
                        <p className="text-white font-bold">
                            {isPremium
                                ? (subscription?.currentPeriodEnd ? fmt(subscription.currentPeriodEnd) : '—')
                                : 'Never'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                            {isPremium ? `${daysLeft} days remaining` : 'Free forever'}
                        </p>
                    </div>

                    {/* Payment method */}
                    <div className="p-6 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Payment</p>
                        <p className="text-white font-bold">
                            {isPremium ? 'Stripe Secured' : '—'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                            {isPremium ? 'Auto-renewed via Stripe' : 'No payment on file'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                  SECTION 3 — PLAN COMPARISON (always shown)
            ══════════════════════════════════════════════════════ */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4">Plan Comparison</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Free Plan */}
                    <div className={`rounded-2xl p-8 border flex flex-col justify-between gap-6 ${
                        !isPremium
                            ? 'bg-zinc-900 border-white/20 ring-1 ring-white/10'
                            : 'bg-zinc-900/40 border-white/5 opacity-80'
                    }`}>
                        <div className="space-y-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={18} className="text-zinc-400" />
                                    <h3 className="text-lg font-bold text-zinc-300">Free Bird Plan</h3>
                                    {!isPremium && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="text-4xl font-black text-white">₹0
                                    <span className="text-base font-bold text-zinc-500"> / forever</span>
                                </p>
                            </div>
                            <div className="space-y-3">
                                {FREE_FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check size={15} className="mt-0.5 text-zinc-500 flex-shrink-0" />
                                        <span className="text-sm text-zinc-400">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`w-full py-3.5 rounded-xl text-center font-bold text-sm ${
                            !isPremium
                                ? 'bg-zinc-800 text-zinc-400 border border-white/5'
                                : 'bg-transparent text-zinc-600 border border-zinc-800'
                        }`}>
                            {!isPremium ? '✓ Your Current Plan' : 'Downgrade'}
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className={`rounded-2xl p-8 border relative overflow-hidden flex flex-col justify-between gap-6 ${
                        isPremium
                            ? 'bg-gradient-to-br from-[#651ea6] to-[#4B0082] border-purple-400/30'
                            : 'bg-[#651ea6]/10 border-[#651ea6]/30 hover:border-[#651ea6]/50 transition-colors'
                    }`}>
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Crown size={18} className="text-yellow-400" />
                                        <h3 className="text-lg font-bold text-white">ProTime Premium</h3>
                                    </div>
                                    {isPremium && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30">
                                            Active
                                        </span>
                                    )}
                                    {!isPremium && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <p className="text-4xl font-black text-white">₹499
                                    <span className="text-base font-bold text-purple-300"> / month</span>
                                </p>
                            </div>
                            <div className="space-y-3">
                                {PREMIUM_FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check size={15} className="mt-0.5 text-yellow-300 flex-shrink-0" strokeWidth={3} />
                                        <span className="text-sm text-white/90 font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative z-10">
                            {isPremium ? (
                                <div className="w-full bg-white/15 text-white font-bold py-3.5 rounded-xl text-center text-sm border border-white/20">
                                    ✓ Currently Subscribed
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate(ROUTES.DASHBOARD_SUBSCRIPTION_PLAN)}
                                    className="w-full bg-white text-[#651ea6] font-bold py-3.5 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Star size={16} /> Upgrade to Premium
                                    <ChevronRight size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                  SECTION 4 — NOTICE / CTA (context-aware)
            ══════════════════════════════════════════════════════ */}
            {!isPremium ? (
                <div className="flex items-start gap-4 bg-[blueviolet]/8 border border-[blueviolet]/20 rounded-2xl p-5">
                    <div className="p-2 rounded-lg bg-[blueviolet]/15 text-[blueviolet] flex-shrink-0 mt-0.5">
                        <Zap size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-bold text-sm mb-0.5">Unlock your full potential</p>
                        <p className="text-zinc-400 text-xs">
                            Get unlimited buddy matches, 100 daily AI tokens, premium badges, and study room creation with ProTime Premium.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD_SUBSCRIPTION_PLAN)}
                        className="flex-shrink-0 bg-[blueviolet] hover:bg-[#7c2ae8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                        Upgrade
                    </button>
                </div>
            ) : (
                <div className="flex items-start gap-4 bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                    <div className="p-2 rounded-lg bg-green-500/15 text-green-400 flex-shrink-0 mt-0.5">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm mb-0.5">Your subscription is managed via Stripe</p>
                        <p className="text-zinc-400 text-xs">
                            To cancel or update your subscription, please contact our support or use the Stripe billing portal. Your access continues until {fmt(subscription?.currentPeriodEnd)}.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
