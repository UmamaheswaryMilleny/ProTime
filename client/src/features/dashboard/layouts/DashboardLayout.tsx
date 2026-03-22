import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useChatSocket } from '../../chat/hooks/useChatSocket';
import { VideoCallOverlay } from '../../chat/components/VideoCallManager';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { socketService } from '../../../shared/services/socketService';

export const DashboardLayout: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('protime_sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Connect socket once when dashboard loads — guards against double-connect internally
    React.useEffect(() => {
        if (user?.accessToken) {
            socketService.connect(user.accessToken);
        }
        // No disconnect here — removing socket mid-session causes reconnect loops during calls.
        // The socket closes naturally when the tab is closed or the user logs out.
    }, [user?.accessToken]);

    useChatSocket();

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

            {/* Global Video Call Overlay */}
            <VideoCallOverlay />
        </div>
    );
};