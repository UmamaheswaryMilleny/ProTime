import React from 'react';
import { FileText, Download, Lock } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';

export const MonthlySummary: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const isPremium = user?.isPremium || false;

    // NOTE: Monthly summary stats (tasks, pomodoro, xp, rooms) 
    // are currently hardcoded as there are no backend endpoints for monthly aggregates yet.
    const stats = [
        { label: 'Tasks Completed', value: '156', trend: '+12%' },
        { label: 'Pomodoro Sessions', value: '84', trend: '+5%' },
        { label: 'XP Earned', value: '4.2k', trend: '+18%' },
        { label: 'Rooms Joined', value: '12', trend: '+2%' },
    ];

    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col gap-6 fade-in h-min">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Monthly Summary</h2>
                    <p className="text-sm text-[#A1A1AA] mt-1">Your performance snapshot for March 2026.</p>
                </div>
                <button
                    disabled={!isPremium}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                        ${isPremium
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95'
                            : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed opacity-70'}
                    `}
                >
                    <Download size={16} />
                    Export
                    {!isPremium && <Lock size={12} className="ml-1" />}
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                            <span className="text-[10px] font-bold text-[#22C55E]">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#2563EB]/5 rounded-xl p-4 flex items-center gap-4 border border-[#2563EB]/10">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="text-xs text-zinc-300">
                        <span className="font-bold text-white text-[13px]">Performance Insight:</span> You're most productive on Tuesday mornings.
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">Keep maintaining your current rhythm to hit your goals.</p>
                </div>
            </div>
        </div>
    );
};
