import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export const GettingStartedWidget: React.FC = () => {
    const steps = [
        { id: 1, label: 'Complete Your Profile', sub: 'Photo, Time Zone, Study Goals', completed: false },
        { id: 2, label: 'Find Your First Study Buddy', sub: 'Connect With Like-Minded Students', completed: false },
        { id: 3, label: 'Try Your First Pomodoro Session', sub: '25 Minutes Of Focused Work', completed: false },
        { id: 4, label: 'Connect Your Calendar', sub: 'Sync Your Study Schedule', completed: false },
        { id: 5, label: 'Ask The AI Assistant', sub: 'For Your First Study Plan', completed: false },
    ];

    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[blueviolet]/20 flex items-center justify-center text-[blueviolet]">
                        <div className="w-4 h-4 border-2 border-[blueviolet] rounded-full" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Getting Started</h2>
                </div>
                <div className="bg-black/50 px-3 py-1 rounded-full text-xs font-semibold text-zinc-400 border border-white/5">
                    0/5 Complete
                </div>
            </div>

            <p className="text-zinc-400 text-sm mb-6">Complete These Steps To Unlock Your Full Potential</p>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-[blueviolet] w-[5%]" />
            </div>

            <div className="space-y-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className="group flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            {step.completed ? (
                                <CheckCircle2 className="text-green-500" size={24} />
                            ) : (
                                <Circle className="text-zinc-500 group-hover:text-white transition-colors" size={24} />
                            )}
                            <div>
                                <h3 className="font-medium text-white text-sm">{step.label}</h3>
                                <p className="text-xs text-zinc-500">{step.sub}</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-zinc-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                ))}
            </div>
        </div>
    );
};
