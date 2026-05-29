import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, ChevronLeft, ChevronRight, CalendarDays, Layers, CreditCard, Gamepad2, Flag, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../auth/store/authSlice';
import { clearForLogout } from '../../notifications/store/notificationSlice';
import { resetGamification } from '../../gamification/store/gamificationSlice';
import { useQueryClient } from '@tanstack/react-query';
import { ProTimeBackend } from '../../../api/instance';
import { ROUTES, API_ROUTES } from '../../../shared/constants/constants.routes';

const realRoutes = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'User Management' },
    { to: ROUTES.ADMIN_SUBSCRIPTIONS, icon: CreditCard, label: 'Subscriptions' },
    { to: ROUTES.ADMIN_REPORTS, icon: Flag, label: 'User Reports' },
    { to: ROUTES.ADMIN_MEETINGS, icon: CalendarDays, label: 'Meeting Management' },
    { to: ROUTES.ADMIN_GAMIFICATION, icon: Gamepad2, label: 'Gamification' },
    { to: ROUTES.ADMIN_SKILLS, icon: Layers, label: 'Skills Management' },
];

export const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAppSelector((s) => s.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close drawer on outside click / ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleLogout = async () => {
        try { await ProTimeBackend.post(API_ROUTES.LOGOUT); } catch { }
        dispatch(clearForLogout());
        dispatch(resetGamification());
        queryClient.clear();
        dispatch(logoutUser());
        navigate(ROUTES.ADMIN_LOGIN);
    };

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <div className={`flex flex-col h-full ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-60'} transition-all duration-300`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
                <div className="p-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] shrink-0">
                    <Shield size={20} />
                </div>
                {(mobile || !collapsed) && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-none">ProTime</p>
                        <p className="text-[10px] text-[#A1A1AA] font-medium tracking-widest uppercase mt-0.5">Admin Panel</p>
                    </div>
                )}
                {mobile && (
                    <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all ml-auto">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
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
                        {(mobile || !collapsed) && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-zinc-800 p-3 space-y-2">
                {(mobile || !collapsed) && (
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
                    {(mobile || !collapsed) && <span>Logout</span>}
                </button>
            </div>

            {/* Desktop Collapse Toggle */}
            {!mobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="mx-auto mb-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090B] text-white flex">

            {/* ── Desktop Sidebar (hidden on mobile) ── */}
            <aside className={`hidden lg:flex flex-col border-r border-zinc-800 bg-[#0D0D10] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} shrink-0`}>
                <SidebarContent />
            </aside>

            {/* ── Mobile Overlay Drawer ── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="relative z-10 flex flex-col bg-[#0D0D10] border-r border-zinc-800 h-full animate-[slideInLeft_0.25s_ease-out]">
                        <SidebarContent mobile />
                    </aside>
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-[#0D0D10] sticky top-0 z-40">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-[#2563EB]/10 text-[#2563EB]">
                            <Shield size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">ProTime Admin</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
