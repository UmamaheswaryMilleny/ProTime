import React from 'react';
import { Users, Video, DollarSign, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';

// ─── User Growth Line Chart (SVG) ──────────────────────────────────────────────
const UserGrowthChart: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
    const w = 560; const h = 180; const pad = { t: 20, r: 20, b: 40, l: 40 };
    
    const displayData = data.length > 5 ? data.slice(-5) : data;
    if (displayData.length === 0) return <div className="text-[#A1A1AA] text-sm text-center py-10">No data available</div>;

    const maxV = Math.max(...displayData.map(d => d.count), 10);
    
    const pts = displayData.map((v, i) => ({
        x: pad.l + i * ((w - pad.l - pad.r) / Math.max(displayData.length - 1, 1)),
        y: h - pad.b - (v.count / maxV) * (h - pad.t - pad.b),
    }));

    const dPath = pts.length > 1 ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') : `M${pts[0].x},${pts[0].y}`;
    const area = pts.length > 1 ? `${dPath} L${pts[pts.length - 1].x.toFixed(1)},${(h - pad.b).toFixed(1)} L${pts[0].x.toFixed(1)},${(h - pad.b).toFixed(1)} Z` : '';
    
    const yTicks = [0, maxV / 4, maxV / 2, (maxV * 3) / 4, maxV].map(Math.round);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
            {/* Y ticks */}
            {yTicks.map(t => {
                const y = h - pad.b - ((t - 0) / maxV) * (h - pad.t - pad.b);
                return (
                    <g key={t}>
                        <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#27272A" strokeWidth="1" />
                        <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#52525B">{t}</text>
                    </g>
                );
            })}
            {/* Area fill */}
            {pts.length > 1 && <path d={area} fill="#2563EB" fillOpacity="0.08" />}
            {/* Line */}
            {pts.length > 1 && <path d={dPath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {/* Dots */}
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563EB" />)}
            {/* X labels */}
            {displayData.map((p, i) => {
                const pt = pts[i];
                const dateStr = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                    <text key={i} x={pt.x} y={h - pad.b + 18} textAnchor="middle" fontSize="11" fill="#71717A">{dateStr}</text>
                );
            })}
        </svg>
    );
};

// ─── Monthly Revenue Bar Chart (SVG) ───────────────────────────────────────────
const RevenueChart: React.FC<{ data: { month: string; revenue: number }[] }> = ({ data }) => {
    const w = 560; const h = 200; const pad = { t: 20, r: 20, b: 40, l: 60 };
    if (data.length === 0) return <div className="text-[#A1A1AA] text-sm text-center py-10">No data available</div>;

    const maxV = Math.max(...data.map(d => d.revenue), 5000);
    const bw = 36; 
    const gap = data.length > 1 ? (w - pad.l - pad.r - data.length * bw) / (data.length - 1) : 0;
    const yTicks = [0, maxV / 5, (maxV * 2) / 5, (maxV * 3) / 5, (maxV * 4) / 5, maxV].map(Math.round);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
            {yTicks.map((t, i) => {
                const y = h - pad.b - (t / maxV) * (h - pad.t - pad.b);
                return (
                    <g key={i}>
                        <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#27272A" strokeWidth="1" />
                        <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#52525B">{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</text>
                    </g>
                );
            })}
            {data.map((v, i) => {
                const x = pad.l + i * (bw + gap);
                const bh = (v.revenue / maxV) * (h - pad.t - pad.b);
                const y = h - pad.b - bh;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={bw} height={bh} rx="4"
                            fill={i % 2 === 0 ? '#7C3AED' : '#A78BFA'} fillOpacity="0.85" />
                        <text x={x + bw / 2} y={h - pad.b + 16} textAnchor="middle" fontSize="10" fill="#71717A">{v.month}</text>
                    </g>
                );
            })}
        </svg>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AdminDashboardPage: React.FC = () => {
    const { data, isLoading, isError } = useAdminDashboardStats();

    if (isLoading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="animate-spin text-white w-8 h-8" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex h-[300px] items-center justify-center text-red-400">
                Failed to load dashboard stats.
            </div>
        );
    }

    const {
        totalUsers,
        premiumUsers,
        monthlyRevenue,
        pendingReports,
        activeRooms,
        userGrowth,
        revenueTrend,
        recentReports,
        recentSignups
    } = data;

    const stats = [
        { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
        { label: 'Premium Users', value: premiumUsers.toLocaleString(), icon: CreditCard, color: 'text-violet-400', bg: 'bg-violet-400/10' },
        { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Pending Reports', value: pendingReports.toLocaleString(), icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Active Rooms', value: activeRooms.toLocaleString(), icon: Video, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">ProTime Admin Overview</h1>
                <p className="text-[#A1A1AA] text-sm mt-1">Real-time platform analytics and insights.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 hover:-translate-y-0.5 transition-transform">
                        <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="text-xl font-bold text-white leading-none">{s.value}</div>
                        <div className="text-xs text-[#A1A1AA] mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Middle Row: Two Charts Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* User Growth Trend */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <h2 className="text-base font-semibold text-white mb-4">User Growth (Last 30 Days)</h2>
                    <UserGrowthChart data={userGrowth} />
                </div>

                {/* Monthly Revenue */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <h2 className="text-base font-semibold text-white mb-4">Revenue Trend (Last 6 Months)</h2>
                    <RevenueChart data={revenueTrend} />
                </div>
            </div>

            {/* Bottom Row: Two Small Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Reports */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-red-400">Recent Pending Reports</h2>
                    </div>
                    {recentReports.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[#A1A1AA]">
                                <thead className="border-b border-[#27272A] text-xs uppercase bg-[#18181B]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Report Reason</th>
                                        <th className="px-4 py-3 font-medium text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReports.map(r => (
                                        <tr key={r.id} className="border-b border-[#27272A] hover:bg-[#27272A]/30">
                                            <td className="px-4 py-3 font-medium text-white">{r.reason}</td>
                                            <td className="px-4 py-3 text-right">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-[#A1A1AA] text-center py-6">No pending reports</div>
                    )}
                </div>

                {/* Recent Signups */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-blue-400">Recent Signups</h2>
                    </div>
                    {recentSignups.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[#A1A1AA]">
                                <thead className="border-b border-[#27272A] text-xs uppercase bg-[#18181B]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">User Name</th>
                                        <th className="px-4 py-3 font-medium text-right">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSignups.map(u => (
                                        <tr key={u.id} className="border-b border-[#27272A] hover:bg-[#27272A]/30">
                                            <td className="px-4 py-3 font-medium text-white">{u.fullName}</td>
                                            <td className="px-4 py-3 text-right">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-[#A1A1AA] text-center py-6">No recent signups</div>
                    )}
                </div>
            </div>

        </div>
    );
};
