import React from 'react';
import { Users, CheckSquare, Calendar, Timer, Video, MessageSquare, Award, BarChart3 } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: "Buddy Matching",
        desc: "Match by availability, goals, and study style. Get suggestions that actually align with your rhythm."
    },
    {
        icon: CheckSquare,
        title: "Shared To-Dos",
        desc: "Build, assign, and conquer tasks together with your study circle."
    },
    {
        icon: Calendar,
        title: "Calendar",
        desc: "A sync calendar to plan your study week, schedule mock tests, and keep upcoming sessions."
    },
    {
        icon: Timer,
        title: "Pomodoro Timer",
        desc: "Shared focus loops built around custom work intervals with built-in breaks to recharge."
    },
    {
        icon: Video,
        title: "Chat & Video",
        desc: "Text and Video communication right inside your session so switching apps."
    },
    {
        icon: MessageSquare,
        title: "AI Chat Assistant",
        desc: "Get instant answers, generate, and helpful insights directly from buddy when a peer session or technical question."
    },
    {
        icon: Award,
        title: "Gamification",
        desc: "Earn points, badges, streaks, and climb leaderboards to stay motivated."
    },
    {
        icon: BarChart3,
        title: "Reports",
        desc: "Weekly summaries help you see active time spent, tasks done, and adjust your pace."
    }
];

export const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="py-20 bg-black relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-20">
                <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-[blueviolet] blur-[150px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">All the tools you need to Thrive</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Designed To Keep You On Track And Into The Level Up—Personally And Professionally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:border-[blueviolet]/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 bg-[blueviolet]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[blueviolet]/20 transition-colors">
                                <feature.icon className="text-[blueviolet]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
