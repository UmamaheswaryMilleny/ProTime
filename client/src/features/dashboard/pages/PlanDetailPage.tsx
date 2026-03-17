import React from 'react';
import { ArrowLeft, ShieldCheck, Zap, MessageSquare, Trophy, UserPlus, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';

export const PlanDetailPage: React.FC = () => {
    const navigate = useNavigate();

    const benefits = [
        { icon: Zap, title: 'Unlimited Study Rooms', desc: 'Join or create as many study rooms as you need, no monthly joins limit.' },
        { icon: UserPlus, title: 'Unlimited ProBuddy Matches', desc: 'No monthly cap on finding and matching with new study buddies.' },
        { icon: MessageSquare, title: '100 AI Tokens Daily', desc: 'Get 5x more AI assistance compared to the free plan every single day.' },
        { icon: Trophy, title: 'Master Level (20) & Badges', desc: 'Unlock progress up to Level 20 and earn exclusive premium-only badges.' },
        { icon: Download, title: 'Download Monthly Reports', desc: 'Export and download comprehensive PDF reports of your productivity data.' },
        { icon: ShieldCheck, title: 'Advanced Matching Filters', desc: 'Fine-tune your buddy matching with premium-only search criteria.' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /><span>Back to Subscriptions</span>
            </Link>

            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">Choose Excellence with ProTime</h1>
                <p className="text-zinc-400 text-lg">Unlock the full potential of your productivity journey.</p>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">ProTime Premium</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white">₹499</span>
                            <span className="text-zinc-400">/ per month</span>
                        </div>
                        <p className="text-zinc-400">
                            Transform the way you study. ProTime Premium is designed for serious learners who want no boundaries.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD_SUBSCRIPTION_PAYMENT)}
                            className="w-full bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[blueviolet]/20"
                        >
                            Proceed to Payment
                        </button>
                        <p className="text-center text-xs text-zinc-500 italic">Secure payment powered by Stripe</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">What's Included</h3>
                        <div className="space-y-4">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-[blueviolet]/10 text-[blueviolet]">
                                        <benefit.icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{benefit.title}</h4>
                                        <p className="text-xs text-zinc-500">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
