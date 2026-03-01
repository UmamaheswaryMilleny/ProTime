import React, { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Buddy {
    id: number;
    name: string;
    username: string;
    location: string;
    image: string;
    description: string;
}

const buddies: Buddy[] = [
    { id: 1, name: 'Alex_learner', username: '@Alex_learner', location: 'Kerala, India', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop', description: 'Connect With Like-Minded Learners Who Share Your Goals' },
    { id: 2, name: 'Alex_learner', username: '@Alex_learner', location: 'Kerala, India', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop', description: 'Connect With Like-Minded Learners Who Share Your Goals' },
];

export const FindBuddyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'mybuddy'>('find');

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Find Your Study Buddy</h1>
                <p className="text-zinc-400">Connect With Like-Minded Learners Who Share Your Goals</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input type="text" placeholder="Search for buddies by username or skill..." className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#8A2BE2] outline-none" />
                </div>
                <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10 overflow-hidden">
                    {(['find', 'requests', 'mybuddy'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-black border border-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}>
                            {tab === 'find' ? 'Find Buddies' : tab === 'requests' ? 'Buddy Requests' : 'My Buddy'}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer">
                    <span className="text-lg">?</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5 space-y-4">
                        <h2 className="text-white font-bold mb-4">My Preferences</h2>
                        {[['Time Zone', 'EST'], ['Study Goal', 'Technology']].map(([label, value]) => (
                            <div key={label} className="space-y-1.5">
                                <label className="text-xs text-zinc-500">{label}</label>
                                <div className="bg-zinc-800/80 rounded px-3 py-2 text-sm text-zinc-300">{value}</div>
                            </div>
                        ))}
                        {[['Language', 'English'], ['Frequency', 'Daily']].map(([label, value]) => (
                            <div key={label} className="space-y-1.5">
                                <label className="text-xs text-zinc-500">{label}</label>
                                <div className="flex justify-between items-center bg-zinc-800/80 rounded px-3 py-2 text-sm text-zinc-300">
                                    <span>{value}</span><ChevronDown size={14} className="text-zinc-500" />
                                </div>
                            </div>
                        ))}
                        <button className="w-full bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white text-sm font-medium py-2 rounded-lg transition-colors mt-2">Apply</button>
                    </div>

                    <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5 space-y-4">
                        <h2 className="text-white font-bold mb-4">Filters</h2>
                        {[['Subject/ Domain','Web Development'],['Focus Level','Casual'],['Study Preference','Chat Only'],['Availability','Daily'],['Study Duration','25 Mint'],['Study Mode','Any']].map(([label, value]) => (
                            <div key={label} className="space-y-1.5">
                                <label className="text-xs text-zinc-500">{label}</label>
                                <div className="flex justify-between items-center bg-zinc-800/80 rounded px-3 py-2 text-sm text-zinc-300 cursor-pointer">
                                    <span>{value}</span><ChevronDown size={14} className="text-zinc-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buddy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {buddies.map((buddy) => (
                        <div key={buddy.id} className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5 relative group h-[222px] flex flex-col justify-between">
                            <button className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={16} /></button>
                            <div>
                                <div className="flex gap-4 mb-3">
                                    <div className="relative">
                                        <img src={buddy.image} alt={buddy.name} className="w-12 h-12 rounded-full border-2 border-green-500 p-0.5" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{buddy.username}</h3>
                                        <p className="text-zinc-400 text-xs">{buddy.location}</p>
                                    </div>
                                </div>
                                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">{buddy.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-300 text-xs font-medium hover:bg-white/5 transition-colors">View Profile</button>
                                <button className="px-3 py-1.5 rounded-lg bg-[#651ea6] hover:bg-[#5b1b94] text-white text-xs font-medium transition-colors">Send Request</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};