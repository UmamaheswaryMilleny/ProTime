import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, ChevronLeft, ChevronRight, CalendarDays, Layers, CreditCard, BarChart2, FileText, Gamepad2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../auth/store/authSlice';
import { ProTimeBackend } from '../../../api/instance';
import { ROUTES, API_ROUTES } from '../../../shared/constants/constants.routes';

const realRoutes = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'User Management' },
];

const placeholderItems = [
    { icon: CalendarDays, label: 'Meeting Management' },
    { icon: Layers, label: 'Skills Management' },
    { icon: CreditCard, label: 'Subscription Plans' },
    { icon: BarChart2, label: 'Revenue Dashboard' },
    { icon: FileText, label: 'User Report' },
    { icon: Gamepad2, label: 'Gamification Mana...' },
];

export const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAppSelector((s) => s.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await ProTimeBackend.post(API_ROUTES.LOGOUT); } catch { }
        dispatch(logoutUser());
        navigate(ROUTES.ADMIN_LOGIN);
    };

    return (
        <div className="min-h-screen bg-[#09090B] text-white flex">
            {/* Sidebar */}
            <aside className={`flex flex-col border-r border-zinc-800 bg-[#0D0D10] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
                    <div className="p-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] shrink-0">
                        <Shield size={20} />
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-sm font-bold text-white leading-none">ProTime</p>
                            <p className="text-[10px] text-[#A1A1AA] font-medium tracking-widest uppercase mt-0.5">Admin</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {/* Real routes — active state highlights blue */}
                    {realRoutes.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-[#2563EB]/10 text-[#2563EB]'
                                    : 'text-[#A1A1AA] hover:text-white hover:bg-zinc-800'
                                }`
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    ))}

                    {/* Placeholder items — hover only, never active */}
                    {placeholderItems.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[#A1A1AA] hover:text-white hover:bg-zinc-800 cursor-pointer select-none opacity-70"
                            title="Coming soon"
                        >
                            <Icon size={18} className="shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </div>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="border-t border-zinc-800 p-3 space-y-2">
                    {!collapsed && (
                        <div className="px-2 py-1">
                            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
                            <p className="text-[11px] text-[#A1A1AA] truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="mx-auto mb-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};
