import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/env'; // ✅ added — was using hardcoded "/dashboard"

export const HelpPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div>
                {/* ✅ was hardcoded to="/dashboard" */}
                <Link to={ROUTES.DASHBOARD} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="text-white" size={32} />
                    <h1 className="text-3xl font-bold text-white">ProTime Help Guide</h1>
                </div>
                <p className="text-zinc-400">Welcome To ProTime Guide! Here's Everything You Need To Know About How XP, Levels, And Badges Work In Our App.</p>
            </div>

            {/* Subscription Rules */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">🔧</span> Subscription Rules
                </h2>
                <ul className="space-y-4 text-sm text-zinc-300">
                    <li>
                        <strong className="text-white">Trial Users (Free Bird):</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-zinc-400">
                            <li>Can Create To-Do Lists And Earn XP.</li>
                            <li>Can See Their Points, But Cannot Unlock Badges Or Level Up.</li>
                            <li>Trial Users Can Join Study Rooms (Limited) But No Community Access.</li>
                            <li>To Unlock Badges, Levels, And Full Access, You Need To Subscribe.</li>
                        </ul>
                    </li>
                    <li>
                        <strong className="text-white">Premium Users (₹499/Month):</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-zinc-400">
                            <li>Get Full Access To All Features.</li>
                            <li>Can Earn Badges, Climb Levels, And Use Community Features.</li>
                            <li>After Your Subscription Ends, You'll Need To Renew To Continue Accessing All Resources.</li>
                        </ul>
                    </li>
                </ul>
            </section>

            {/* To-Do XP System */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-500">✅</span> To-Do XP System
                </h2>
                <p className="text-sm text-zinc-300 mb-2">Earn XP For Completing Tasks Based On Priority:</p>
                <ul className="space-y-2 text-sm text-zinc-400">
                    <li>🟢 Low Priority Task → +2 XP</li>
                    <li>🟡 Medium Priority Task → +3 XP (+3 XP Bonus If Completed With Pomodoro = 25 Minutes)</li>
                    <li>🔴 High Priority Task → +5 XP (+5 XP Bonus If Completed With Pomodoro = 1 Hour)</li>
                </ul>
                <h3 className="font-bold text-white mt-4 mb-2 flex items-center gap-2 text-sm">⚠️ Daily XP Limits:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                    <li>Only 10 Tasks Per Day Give XP.</li>
                    <li>Only 3 Medium And 3 High Priority Tasks Per Day Count For XP.</li>
                </ul>
            </section>

            {/* Streak XP Bonuses */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-orange-500">🔥</span> Streak XP Bonuses
                </h2>
                <p className="text-sm text-zinc-300 mb-2">
                    Stay Consistent And Get Extra XP For Streaks! <br />
                    (To Count: You Must Complete At Least 1 To-Do With Pomodoro Each Day).
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-zinc-400">
                    <div>• 1 Day → +0 XP</div><div>• 3 Days → +5 XP</div><div>• 5 Days → +10 XP</div>
                    <div>• 7 Days → +15 XP</div><div>• 10 Days → +25 XP</div><div>• 15 Days → +40 XP</div>
                    <div>• 20 Days → +60 XP</div><div>• 30 Days → +100 XP</div><div>• 50 Days → +200 XP</div>
                    <div>• 75 Days → +300 XP</div><div>• 100 Days → +500 XP</div>
                </div>
            </section>

            {/* Badge System */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-500">🏅</span> Badge System
                </h2>
                <p className="text-sm text-zinc-300 mb-4">(Only Premium Users Can Unlock Badges — Each Badge = +50 XP Bonus)</p>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1">📌 Task Completion Badges</h3>
                        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                            <li>High Achiever → Complete 10 High-Priority Tasks.</li>
                            <li>Medium Master → Complete 15 Medium-Priority Tasks.</li>
                            <li>Steady Starter → Complete 20 Low-Priority Tasks.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1">📌 Streak Badges</h3>
                        <p className="text-xs text-zinc-500 mb-1">(At Least 1 To-Do Daily + Pomodoro Used)</p>
                        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                            <li>Focus Builder → 7-Day Streak.</li>
                            <li>Consistency Champ → 10-Day Streak.</li>
                            <li>Discipline Hero → 16-Day Streak.</li>
                            <li>Persistence Pro → 28-Day Streak.</li>
                            <li>Real Warrior → 52-Day Streak.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1">📌 Buddy Collaboration Badges</h3>
                        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                            <li>Buddy Beginner → Matched With 2 Buddies (Min 4⭐ Rating, 1 Hour Each).</li>
                            <li>Buddy Builder → Matched With 5 Buddies (Min 4⭐ Rating, 1 Hour Each).</li>
                            <li>Buddy Master → Matched With 10 Buddies (Min 4⭐ Rating, 1 Hour Each).</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1">📌 Group Room Participation Badges</h3>
                        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                            <li>Room Explorer → Attended 2 Group Rooms (Min 1 Hour Each).</li>
                            <li>Room Regular → Attended 5 Group Rooms (Min 1 Hour Each).</li>
                            <li>Room Leader → Attended 10 Group Rooms (Min 1 Hour Each).</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Level System */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-500">🚀</span> Level System
                </h2>
                <p className="text-sm text-zinc-300 mb-4">Every XP You Earn Helps You Level Up.</p>
                <h3 className="font-bold text-white text-sm mb-2">🧮 Level XP Requirements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-zinc-400">
                    {["Level 1 → 100 XP","Level 2 → 150 XP","Level 3 → 200 XP","Level 4 → 250 XP",
                      "Level 5 → 300 XP","Level 6 → 350 XP","Level 7 → 400 XP","Level 8 → 450 XP",
                      "Level 9 → 500 XP","Level 10 → 600 XP","Level 11 → 700 XP","Level 12 → 800 XP",
                      "Level 13 → 900 XP","Level 14 → 1000 XP","Level 15 → 1150 XP","Level 16 → 1300 XP",
                      "Level 17 → 1450 XP","Level 18 → 1600 XP","Level 19 → 1800 XP","Level 20 → 2000 XP"
                    ].map((level, i) => (<div key={i}>• {level}</div>))}
                </div>
            </section>

            {/* Level Titles */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-400">🏆</span> Level Titles
                </h2>
                <ul className="space-y-2 text-sm text-zinc-400">
                    <li>• Level 0 → Early Bird 🥚</li>
                    <li>• Levels 1 – 3 → Beginner 🌱</li>
                    <li>• Levels 4 – 6 → Learner 📘</li>
                    <li>• Levels 7 – 9 → Explorer 🔍</li>
                    <li>• Levels 10 – 12 → Achiever 🥇</li>
                    <li>• Levels 13 – 15 → Expert 🎓</li>
                    <li>• Levels 16 – 18 → Prodigy 🚀</li>
                    <li>• Levels 19 – 20 → Master 🤴</li>
                </ul>
            </section>
        </div>
    );
};