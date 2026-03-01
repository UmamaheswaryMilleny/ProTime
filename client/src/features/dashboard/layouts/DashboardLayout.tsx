import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('protime_sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    React.useEffect(() => {
        localStorage.setItem('protime_sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            {/* Main Content — left margin matches sidebar width on desktop */}
            <main className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Outlet />
            </main>
        </div>
    );
};