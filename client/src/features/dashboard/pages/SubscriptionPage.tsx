import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { subscriptionService } from '../api/subscription-service';
import type { SubscriptionResponse } from '../api/subscription-service';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateUser } from '../../auth/store/authSlice';

export const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(state => state.auth.user);
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const data = await subscriptionService.getSubscription();
                setSubscription(data);

                // ─── Sync isPremium into Redux if stale JWT ───────────────────
                // The JWT is issued at login time — if user just paid, the token
                // still has isPremium=false. We fix this by reading the fresh DB
                // value and patching the Redux state + localStorage directly.
                if (data?.isPremium && !authUser?.isPremium) {
                    dispatch(updateUser({ isPremium: true }));
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

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[blueviolet]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="space-y-4">
                <Link to={ROUTES.USER_PROFILE} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Subscription Plans</h1>
                    <p className="text-zinc-400 font-medium">
                        {subscription?.isPremium
                            ? "You are currently enjoying ProTime Premium benefits."
                            : "Choose the plan that fits your productivity needs."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Free Plan Card */}
                <div className="bg-zinc-900/50 rounded-[32px] p-10 border border-white/10 space-y-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-2 text-zinc-300">Free Bird Plan</h2>
                            <div className="flex items-baseline gap-2 text-white">
                                <span className="text-6xl font-extrabold tracking-tight">₹0</span>
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">/forever</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                'Unlimited Todos & Pomodoro',
                                '5 Buddy Matches per month',
                                '3 Group Room joins per month',
                                '10 Community Chats per day',
                                'Level Cap: Level 6 (Learner)',
                                '20 AI Tokens per day',
                                'View Monthly Reports'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Check size={16} className="mt-1 text-zinc-500" />
                                    <span className="text-sm text-zinc-400 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        {!subscription?.isPremium ? (
                            <div className="w-full bg-zinc-800 text-zinc-500 font-bold py-4 rounded-2xl text-center border border-white/5 text-lg">
                                Current Plan
                            </div>
                        ) : (
                            <div className="h-14" /> // Spacer
                        )}
                    </div>
                </div>

                {/* Premium Plan Card */}
                <div className="bg-[#651ea6] rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                    {/* Decorative Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-white/90">ProTime Premium</h2>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-extrabold tracking-tight">₹499</span>
                                    <span className="text-sm font-bold text-[#FAFF00] uppercase tracking-wider">/monthly</span>
                                </div>
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Recommended</div>
                        </div>

                        <div className="space-y-4">
                            {[
                                'Everything in Free Plan',
                                'Unlimited Buddy Matches & Rooms',
                                'Create your own Study Rooms',
                                'Unlimited Community Chat',
                                'Level Cap: Level 20 (Master)',
                                '100 AI Tokens per day',
                                'Download Monthly Reports',
                                'Premium Badges & Advanced Filters',
                                'Bonus Streak XP Rewards'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <Check size={18} className="mt-1 text-white bg-white/20 rounded-full p-0.5" strokeWidth={3} />
                                    <span className="text-sm font-bold text-white/90 leading-relaxed">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-4">
                        {!subscription?.isPremium ? (
                            <button
                                onClick={() => navigate(ROUTES.DASHBOARD_SUBSCRIPTION_PLAN)}
                                className="w-full bg-white text-[#651ea6] font-bold py-4 rounded-2xl hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-xl text-lg"
                            >
                                Upgrade Now
                            </button>
                        ) : (
                            <div className="w-full bg-white/20 text-white font-bold py-4 rounded-2xl text-center border border-white/30 text-lg">
                                Currently Subscribed
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment History Section (Simplified) */}
            <div className="bg-zinc-900/30 rounded-3xl p-8 border border-white/5 mt-12">
                <h2 className="text-xl font-bold text-white mb-6">Subscription Details</h2>
                {subscription?.isPremium ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Status</p>
                            <p className="text-green-500 font-bold">Active</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Next Billing</p>
                            <p className="text-white font-bold">{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Monthly'}</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Payment Method</p>
                            <p className="text-white font-bold">Stripe Secured</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-zinc-500 text-sm italic">Upgrade to Premium to track billing and unlock advanced features.</p>
                )}
            </div>
        </div>
    );
};
