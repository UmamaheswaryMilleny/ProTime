import React from 'react';
import { Play, ToggleRight, ToggleLeft, Calendar, Users, MonitorPlay, Bot } from 'lucide-react';

export const TodaysTasksPanel: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full fade-in">
            {/* Left Column: Today's Tasks */}
            <div className="lg:col-span-8 bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Today's Tasks</h2>
                    <p className="text-sm text-[#A1A1AA] mt-1">Complete up to 10 XP-eligible tasks today.</p>
                </div>

                <div className="space-y-4">
                    {/* Task Row 1 */}
                    <div className="bg-[#1F1F23] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-sm">
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="font-bold text-white text-base">Complete Database Architecture Model</span>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">High Priority</span>
                                <span className="text-[#22C55E] flex items-center gap-1">✨ +50 XP</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium flex-1 sm:flex-auto justify-center">
                                <Play size={16} />
                                Start
                            </button>
                            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors" title="Toggle Pomodoro">
                                <ToggleRight size={28} className="text-[#2563EB]" />
                            </button>
                        </div>
                    </div>

                    {/* Task Row 2 */}
                    <div className="bg-[#1F1F23] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-sm">
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="font-bold text-white text-base">Write API Route Tests</span>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Medium Priority</span>
                                <span className="text-[#22C55E] flex items-center gap-1">✨ +30 XP</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium flex-1 sm:flex-auto justify-center">
                                <Play size={16} />
                                Start
                            </button>
                            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors" title="Toggle Pomodoro">
                                <ToggleLeft size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Task Row 3 */}
                    <div className="bg-[#1F1F23] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-sm">
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="font-bold text-white text-base">Review Pull Requests</span>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Low Priority</span>
                                <span className="text-[#22C55E] flex items-center gap-1">✨ +10 XP</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium flex-1 sm:flex-auto justify-center">
                                <Play size={16} />
                                Start
                            </button>
                            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors" title="Toggle Pomodoro">
                                <ToggleLeft size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-500/10 rounded-xl p-4 text-center mt-2 border border-zinc-700/50">
                    <p className="text-[#A1A1AA] text-sm">
                        Daily XP limit reached. Keep going to maintain your streak.
                    </p>
                </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="lg:col-span-4 bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Quick Actions</h2>

                <div className="space-y-4 flex flex-col h-full">
                    <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1F1F23] transition-all group text-left">
                        <div className="p-2.5 rounded-lg bg-zinc-800 text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                            <Calendar size={20} />
                        </div>
                        <span className="font-semibold text-zinc-200 group-hover:text-white">Schedule Session</span>
                    </button>

                    <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1F1F23] transition-all group text-left">
                        <div className="p-2.5 rounded-lg bg-zinc-800 text-[#F97316] group-hover:scale-110 group-hover:bg-[#F97316] group-hover:text-white transition-all">
                            <Users size={20} />
                        </div>
                        <span className="font-semibold text-zinc-200 group-hover:text-white">Find Study Buddy</span>
                    </button>

                    <div className="flex flex-col gap-1 w-full">
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1F1F23] transition-all group text-left">
                            <div className="p-2.5 rounded-lg bg-zinc-800 text-[#22C55E] group-hover:scale-110 group-hover:bg-[#22C55E] group-hover:text-white transition-all">
                                <MonitorPlay size={20} />
                            </div>
                            <span className="font-semibold text-zinc-200 group-hover:text-white">Join Group Room</span>
                        </button>
                        <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 px-1 mt-1 font-medium">
                            <span>5/5 rooms joined this month</span>
                            <span className="text-zinc-500">🔒</span>
                        </p>
                    </div>

                    <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1F1F23] transition-all group text-left mt-auto">
                        <div className="p-2.5 rounded-lg bg-zinc-800 text-[blueviolet] group-hover:scale-110 group-hover:bg-[blueviolet] group-hover:text-white transition-all">
                            <Bot size={20} />
                        </div>
                        <span className="font-semibold text-zinc-200 group-hover:text-white">Ask ProBuddy AI</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
