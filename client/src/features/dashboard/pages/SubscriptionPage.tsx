import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/env'; // ✅ added — was using hardcoded "/dashboard/profile"

export const SubscriptionPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="space-y-4">
                {/* ✅ was hardcoded to="/dashboard/profile" */}
                <Link to={ROUTES.USER_PROFILE} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Subscriptions</h1>
                    <p className="text-zinc-400">12 Days Left In Your Free Trial</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Plan Card */}
                <div className="bg-[#651ea6] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div>
                            <h2 className="text-lg font-medium mb-1 opacity-90">ProTime Plan</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold">₹499</span>
                                <span className="text-sm font-medium opacity-80 text-yellow-300">/monthly after trial</span>
                            </div>
                        </div>

                        <button className="w-full bg-white text-[#8A2BE2] font-bold py-3 rounded-full hover:bg-gray-100 transition-colors">
                            Subscribe Now
                        </button>

                        <div className="space-y-4 pt-4">
                            {[
                                'Everything from trial',
                                'Study Room joining unlimited',
                                'Can create Study rooms',
                                'Can have access to community chat',
                                'Premium Badges for task completion',
                                'ProBuddy usage Unlimited',
                                'Report download available'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="mt-1 p-0.5 rounded-full bg-white/20">
                                        <Check size={12} className="text-white" />
                                    </div>
                                    <span className="text-sm font-medium opacity-90">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-white">Payment history</h2>
                    <p className="text-zinc-500 text-sm">(No payment History Available)</p>
                </div>
            </div>
        </div>
    );
};