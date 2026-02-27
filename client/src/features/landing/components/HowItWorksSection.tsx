import React from 'react';

export const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            number: "1",
            title: "Create Your Profile",
            desc: "Share your goals, availability, and preferences to help us suggest ideal buddies."
        },
        {
            number: "2",
            title: "Match & Start a Session",
            desc: "Find a compatible partner or launch a group session to collaborate in a virtual habitat."
        },
        {
            number: "3",
            title: "Review & Improve",
            desc: "See what you accomplished, get a daily recap, and keep building productive streaks."
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything You Need To Learn</h2>
                    <p className="text-zinc-400">Start exchanging skills and finding study buddies in four simple steps</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-black border-4 border-zinc-800 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-8 group-hover:border-[blueviolet] group-hover:bg-[blueviolet]/10 transition-all duration-300 relative z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-zinc-400 max-w-xs mx-auto leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
