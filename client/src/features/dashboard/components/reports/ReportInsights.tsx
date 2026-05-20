import React from 'react';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

interface Insight {
    icon: 'sparkles' | 'trending' | 'target';
    text: string;
}

interface ReportInsightsProps {
    insights: Insight[];
}

export const ReportInsights: React.FC<ReportInsightsProps> = ({ insights }) => {
    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute top-[-50%] right-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none" />

            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-400" />
                AI Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex items-start gap-3 hover:bg-zinc-800 transition-colors">
                        <div className="mt-0.5">
                            {insight.icon === 'sparkles' && <Sparkles size={18} className="text-yellow-400" />}
                            {insight.icon === 'trending' && <TrendingUp size={18} className="text-green-400" />}
                            {insight.icon === 'target' && <Target size={18} className="text-blue-400" />}
                        </div>
                        <p className="text-sm text-zinc-300 leading-snug">{insight.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
