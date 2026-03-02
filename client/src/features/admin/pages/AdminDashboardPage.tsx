import React from 'react';
import { Users, Activity, Video, DollarSign, CreditCard, UserCheck } from 'lucide-react';

// ─── Stat Cards ───────────────────────────────────────────────────────────────
const stats = [
    { label: 'Total Users', value: '635', sub: '', icon: Users, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
    { label: 'Active Today', value: '133', sub: '', icon: Activity, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { label: 'Meetings Now', value: '127', sub: '(Today)', icon: Video, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
    { label: 'Revenue (Month)', value: '299,400', sub: '', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Subscriptions', value: '600', sub: '', icon: CreditCard, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Buddy Matches', value: '100', sub: '(Today)', icon: UserCheck, color: 'text-pink-400', bg: 'bg-pink-400/10' },
];

// ─── Activity Feed ─────────────────────────────────────────────────────────────
const activities = [
    { title: 'Subscriptions upgrade', desc: 'Mike.chen upgraded to Premium plan', time: '12 min ago', dot: 'bg-violet-400' },
    { title: 'Buddy Match Approved', desc: 'Alex_sans and Sansa_tp started Buddy session', time: '11 min ago', dot: 'bg-[#22C55E]' },
    { title: 'New Users Registered', desc: 'Amelia_can Just joined ProTime', time: '10 min ago', dot: 'bg-[#2563EB]' },
    { title: 'Subscription downgraded', desc: 'john_doe moved back to Free plan', time: '8 min ago', dot: 'bg-red-400' },
    { title: 'Meeting room created', desc: 'Team Alpha booked a 2h session', time: '5 min ago', dot: 'bg-[#F97316]' },
];

// ─── User Growth Line Chart (SVG) ──────────────────────────────────────────────
const growthData = [100, 160, 200, 185, 175, 195, 165, 180, 210, 190, 200, 185];
const months = ['Jan', 'Feb', 'March', 'April', 'May'];

const UserGrowthChart: React.FC = () => {
    const w = 560; const h = 180; const pad = { t: 20, r: 20, b: 40, l: 40 };
    const pts = growthData.slice(0, 5).map((v, i) => ({
        x: pad.l + i * ((w - pad.l - pad.r) / 4),
        y: h - pad.b - ((v - 80) / 160) * (h - pad.t - pad.b),
    }));
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${d} L${pts[pts.length - 1].x.toFixed(1)},${(h - pad.b).toFixed(1)} L${pts[0].x.toFixed(1)},${(h - pad.b).toFixed(1)} Z`;
    const yTicks = [0, 100, 200, 300];
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
            {/* Y ticks */}
            {yTicks.map(t => {
                const y = h - pad.b - ((t - 0) / 300) * (h - pad.t - pad.b);
                return (
                    <g key={t}>
                        <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#27272A" strokeWidth="1" />
                        <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#52525B">{t}</text>
                    </g>
                );
            })}
            {/* Area fill */}
            <path d={area} fill="#2563EB" fillOpacity="0.08" />
            {/* Line */}
            <path d={d} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Dots */}
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563EB" />)}
            {/* X labels */}
            {pts.map((p, i) => (
                <text key={i} x={p.x} y={h - pad.b + 18} textAnchor="middle" fontSize="11" fill="#71717A">{months[i]}</text>
            ))}
        </svg>
    );
};

// ─── Monthly Revenue Bar Chart (SVG) ───────────────────────────────────────────
const revenueData = [325000, 45000, 130000, 42000, 265000, 52000, 190000];
const revMonths = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July'];

const RevenueChart: React.FC = () => {
    const w = 560; const h = 200; const pad = { t: 20, r: 20, b: 40, l: 60 };
    const maxV = Math.max(...revenueData);
    const bw = 36; const gap = (w - pad.l - pad.r - revenueData.length * bw) / (revenueData.length - 1);
    const yTicks = [0, 6500, 13000, 19500, 26000, 325000];
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
            {yTicks.map((t, i) => {
                const y = h - pad.b - (t / maxV) * (h - pad.t - pad.b);
                return (
                    <g key={i}>
                        <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#27272A" strokeWidth="1" />
                        <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#52525B">{t >= 1000 ? `${t / 1000}k` : t}</text>
                    </g>
                );
            })}
            {revenueData.map((v, i) => {
                const x = pad.l + i * (bw + gap);
                const bh = (v / maxV) * (h - pad.t - pad.b);
                const y = h - pad.b - bh;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={bw} height={bh} rx="4"
                            fill={i % 2 === 0 ? '#7C3AED' : '#A78BFA'} fillOpacity="0.85" />
                        <text x={x + bw / 2} y={h - pad.b + 16} textAnchor="middle" fontSize="10" fill="#71717A">{revMonths[i]}</text>
                    </g>
                );
            })}
        </svg>
    );
};

// ─── Subscription Donut (SVG) ──────────────────────────────────────────────────
const SubDonut: React.FC = () => {
    const cx = 120; const cy = 100; const r = 75; const stroke = 28;
    const circumference = Math.PI * r; // semicircle
    const premiumPct = 0.35; const freePct = 0.45;
    const totalPct = premiumPct + freePct; // 80% shown (rest = empty)
    return (
        <svg viewBox="0 0 240 130" className="w-full" style={{ height: 140 }}>
            {/* background arc */}
            <path
                d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
                fill="none" stroke="#27272A" strokeWidth={stroke} strokeLinecap="round"
            />
            {/* free arc */}
            <path
                d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
                fill="none" stroke="#A78BFA" strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={`${freePct / totalPct * circumference} ${circumference}`}
                strokeDashoffset={`-${premiumPct / totalPct * circumference}`}
            />
            {/* premium arc */}
            <path
                d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
                fill="none" stroke="#7C3AED" strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={`${premiumPct / totalPct * circumference} ${circumference}`}
            />
            {/* labels */}
            <circle cx="32" cy="118" r="6" fill="#7C3AED" />
            <text x="42" y="122" fontSize="11" fill="#A1A1AA">35% Premium</text>
            <circle cx="133" cy="118" r="6" fill="#A78BFA" />
            <text x="143" y="122" fontSize="11" fill="#A1A1AA">45% Free</text>
        </svg>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AdminDashboardPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">ProTime Admin Overview</h1>
                <p className="text-[#A1A1AA] text-sm mt-1">Real-time platform analytics and insights.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 hover:-translate-y-0.5 transition-transform">
                        <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="text-xl font-bold text-white leading-none">{s.value}</div>
                        {s.sub && <div className="text-[10px] text-[#A1A1AA] mt-0.5">{s.sub}</div>}
                        <div className="text-xs text-[#A1A1AA] mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Middle Row: Growth Chart + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* User Growth Trend */}
                <div className="lg:col-span-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <h2 className="text-base font-semibold text-white mb-4">User Growth Trend</h2>
                    <UserGrowthChart />
                </div>

                {/* Real-Time Activity Feed */}
                <div className="lg:col-span-2 bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <h2 className="text-base font-semibold text-[#2563EB] mb-4">Real‑Time Activity Feed</h2>
                    <div className="space-y-4">
                        {activities.map((a, i) => (
                            <div key={i} className="flex gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.dot}`} />
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">{a.title}</p>
                                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                                        {a.desc}
                                        <span className="ml-2 text-zinc-600">{a.time}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Revenue Chart + Subscription Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Monthly Revenue */}
                <div className="lg:col-span-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <h2 className="text-base font-semibold text-white mb-4">Monthly Revenue</h2>
                    <RevenueChart />
                </div>

                {/* Subscription Distribution */}
                <div className="lg:col-span-2 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col">
                    <h2 className="text-base font-semibold text-white mb-2">Subscription Distribution</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <SubDonut />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-[#0D0D10] rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-violet-400">35%</div>
                            <div className="text-xs text-[#A1A1AA] mt-0.5">Premium Users</div>
                        </div>
                        <div className="bg-[#0D0D10] rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-[#A78BFA]">45%</div>
                            <div className="text-xs text-[#A1A1AA] mt-0.5">Free Users</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
