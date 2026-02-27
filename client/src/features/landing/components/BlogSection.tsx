import React from 'react';

const posts = [
    {
        title: "5 Ways to Make Remote Work work for You",
        date: "July 20, 2023 - Productivity",
        excerpt: "Maximize availability, goals, and study style. Get suggestions that actually align with your rhythm...",
    },
    {
        title: "Deep Work Mastery: What Actually Works?",
        date: "August 5, 2023 - Community",
        excerpt: "Insights from successful study pals — how time zones alignment and goal setting improve outcomes...",
    },
    {
        title: "Using AI to Stay Accountable",
        date: "July 12, 2023 - AI",
        excerpt: "How to prompt your ProTime AI assistant for instant feedback...",
    }
];

export const BlogSection: React.FC = () => {
    return (
        <section id="blog" className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From the ProTime Blog</h2>
                    <p className="text-zinc-400">Tips, Tricks, Product News, Strategies And Community Stories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <div key={index} className="bg-[blueviolet] rounded-2xl p-8 hover:bg-[#7A45E5] transition-colors group cursor-pointer">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:underline decoration-2 underline-offset-4">{post.title}</h3>
                            <p className="text-white/70 text-xs mb-4">{post.date}</p>
                            <p className="text-white/90 text-sm leading-relaxed mb-6">
                                {post.excerpt}
                            </p>

                            <button className="bg-black text-white text-xs font-bold px-6 py-2 rounded-full uppercase tracking-wider hover:bg-zinc-800 transition-colors">
                                Read More
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
