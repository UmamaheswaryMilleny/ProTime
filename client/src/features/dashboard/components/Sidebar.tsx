import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CheckSquare,
    Video,
    Calendar,
    MessageSquare,
    BarChart2,
    Trophy,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ROUTES } from '../../../config/env'; // ✅ added — was using hardcoded path strings

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
    const [hoveredItem, setHoveredItem] = React.useState<{ label: string; top: number } | null>(null);

    const navItems = [
        // ✅ was hardcoded '/dashboard' and '/dashboard/find-buddy' — now uses ROUTES constants
        { icon: LayoutDashboard, label: 'Dashboard',   path: ROUTES.DASHBOARD,            end: true  },
        { icon: Users,           label: 'Find Buddy',  path: ROUTES.DASHBOARD_FIND_BUDDY, end: false },
        { icon: CheckSquare,     label: 'To-Do List',  path: '#',                         end: false },
        { icon: Video,           label: 'Study Rooms', path: '#',                         end: false },
        { icon: Calendar,        label: 'Calender',    path: '#',                         end: false },
        { icon: MessageSquare,   label: 'Community',   path: '#',                         end: false },
        { icon: BarChart2,       label: 'Reports',     path: '#',                         end: false },
        { icon: Trophy,          label: 'Leaderboard', path: '#',                         end: false },
    ];

    return (
        <aside
            // ✅ was "flex flex-col hidden lg:flex" — standalone `flex` and `hidden` conflict at base level
            //    causing sidebar to never hide on mobile. Fix: remove standalone `flex`, keep "hidden lg:flex"
            className={`bg-zinc-900 border-r border-white/10 h-screen fixed left-0 top-0 hidden lg:flex flex-col transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo */}
            <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <div className="text-2xl font-bold flex items-center gap-1">
                        <span className="text-[blueviolet]">Pro</span>
                        <span className="text-white">Time</span>
                    </div>
                ) : (
                    <div className="text-2xl font-bold flex items-center">
                        <span className="text-[blueviolet]">P</span>
                        <span className="text-white">T</span>
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.end}
                        onMouseEnter={(e) => {
                            if (isCollapsed) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredItem({ label: item.label, top: rect.top });
                            }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                                isActive && item.path !== '#'
                                    ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            } ${isCollapsed ? 'justify-center' : ''}`
                        }
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Floating Tooltip — outside overflow container so it isn't clipped */}
            {isCollapsed && hoveredItem && (
                <div
                    className="fixed left-24 px-3 py-1.5 bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xl border border-white/10 z-50 pointer-events-none whitespace-nowrap"
                    style={{ top: hoveredItem.top }}
                >
                    {hoveredItem.label}
                    {/* Arrow pointing left */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-zinc-800" />
                </div>
            )}
        </aside>
    );
};