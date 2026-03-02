import React from 'react';
import { Download, Lock } from 'lucide-react';

export const MonthlySummary: React.FC = () => {
    return (
        <div className="w-full bg-[#18181B] rounded-2xl shadow-sm border border-[#27272A] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 fade-in hover:shadow-md transition-shadow">

            <div className="flex-1 w-full">
                <h2 className="text-2xl font-bold text-white mb-6">This Month</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div>
                        <div className="text-3xl font-bold text-white">42</div>
                        <div className="text-sm font-medium text-[#A1A1AA] mt-1">Tasks Completed</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">18</div>
                        <div className="text-sm font-medium text-[#A1A1AA] mt-1">Pomodoro Sessions</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#22C55E]">320</div>
                        <div className="text-sm font-medium text-[#A1A1AA] mt-1">XP Earned</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">3</div>
                        <div className="text-sm font-medium text-[#A1A1AA] mt-1">Rooms Joined</div>
                    </div>
                </div>
            </div>

            {/* Right Side: Export Button */}
            <div className="md:ml-auto group relative self-start md:self-center">
                <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 font-medium cursor-not-allowed transition-all"
                >
                    <Download size={18} />
                    Export
                    <Lock size={16} className="ml-1" />
                </button>

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#1F1F23] border border-zinc-700 text-xs text-white rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap z-10">
                    Export reports with Premium.
                </div>
            </div>
        </div>
    );
};
