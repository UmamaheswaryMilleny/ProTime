import React from 'react';
import { Check, X } from 'lucide-react';

export const PricingSection: React.FC = () => {

    return (
        <section id="pricing" className="py-24 bg-black relative overflow-hidden">
            {/* Decorative Blob */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[blueviolet]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
                <p className="text-zinc-400 mb-10">You're Start Free. When You Start To Enjoy Then You Subscribe Our ProTime Plan</p>

                {/* Pricing Toggle (Visual only for now since price is fixed in text) */}
                {/* <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
            <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 bg-zinc-800 rounded-full relative p-1 transition-colors"
            >
                <div className={`w-4 h-4 bg-[blueviolet] rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-zinc-500'}`}>Yearly</span>
        </div> */}

                <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">

                    {/* Free Plan */}
                    <div className="flex-1 bg-zinc-900/30 border border-white/10 rounded-2xl p-8 text-left hover:border-white/20 transition-colors">
                        <h3 className="text-lg font-medium text-white mb-2">Free Trial (1 Month)</h3>
                        <div className="text-4xl font-bold text-white mb-6">₹0<span className="text-lg font-normal text-zinc-500"> / for first month</span></div>

                        <button className="w-full bg-white text-black font-medium py-3 rounded-lg mb-8 hover:bg-gray-200 transition-colors">
                            Get started for free
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-300">
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Todolist - Unlimited</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Access to Calendar</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Access to Groups: Join up to 3 groups</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span>ProBuddy Token Query: Up to 30</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span>10 Buddy Matches</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <X size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-500">Room Creation</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <X size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-500">Progress Report</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <X size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-500">Badges or XP Points</span>
                            </li>
                        </ul>
                    </div>

                    {/* ProTime Plan */}
                    <div className="flex-1 bg-gradient-to-b from-[blueviolet] to-[#5b2091] rounded-2xl p-8 text-left relative transform md:-translate-y-4 shadow-2xl shadow-[blueviolet]/20">
                        <div className="absolute top-0 right-0 bg-white text-[blueviolet] text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                            MOST POPULAR
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">ProTime Plan</h3>
                        <div className="text-4xl font-bold text-white mb-6">₹499<span className="text-lg font-normal text-white/70"> / month after trial</span></div>

                        <button className="w-full bg-white text-[blueviolet] font-medium py-3 rounded-lg mb-8 hover:bg-gray-100 transition-colors">
                            Upgrade now
                        </button>

                        <ul className="space-y-4 text-sm text-white">
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Everything from trial</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Study Room Joining: Unlimited</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Create Study Rooms</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Access to Community Chat</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Badges and XP Points</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>More Tokens for ProBuddy</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check size={18} className="text-white shrink-0 mt-0.5" />
                                <span>Progress Reports</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
