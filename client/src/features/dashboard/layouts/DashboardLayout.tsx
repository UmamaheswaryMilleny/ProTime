import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useChatSocket } from '../../chat/hooks/useChatSocket';
import { VideoCallOverlay } from '../../chat/components/VideoCallManager';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store/store';
import { socketService } from '../../../shared/services/socketService';
import { useSessionReminder } from '../../calendar/hooks/useSessionReminder';
import { tick, completeActivePomodoro } from '../../todo/store/pomodoroSlice';

export const DashboardLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.auth.user);
    const { 
        activeTask, isRunning, timeRemaining, phase, ownConversationId,
        buddyActiveTask, buddyIsRunning 
    } = useAppSelector((state: RootState) => state.pomodoro);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('protime_sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Connect socket once when dashboard loads — guards against double-connect internally
    React.useEffect(() => {
        if (user?.accessToken) {
            socketService.connect(user.accessToken);
        }
    }, [user?.accessToken]);

    useChatSocket();
    useSessionReminder();

    // Global Pomodoro Timer Ticker
    React.useEffect(() => {
        let interval: number;
        
        // Tick if either our timer or buddy's timer is running
        const shouldTick = (activeTask && isRunning) || (buddyActiveTask && buddyIsRunning);
        
        if (shouldTick) {
            interval = window.setInterval(() => {
                dispatch(tick());
                
                // Emit tick to sync with buddy every 5 seconds if WE are the one running the timer
                if (activeTask && isRunning && timeRemaining % 5 === 0 && ownConversationId) {
                    socketService.emit('pomodoro:tick', { 
                        conversationId: ownConversationId, 
                        timeRemaining 
                    });
                }
            }, 1000);
        } else if (activeTask && !isRunning) {
            // Even when paused, we tick to track paused seconds
            interval = window.setInterval(() => {
                dispatch(tick());
            }, 1000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [activeTask, isRunning, timeRemaining, buddyActiveTask, buddyIsRunning, dispatch, ownConversationId]);

    // Global Completion Logic
    React.useEffect(() => {
        if (activeTask && timeRemaining === 0 && phase === 'FOCUS' && isRunning) {
            dispatch(completeActivePomodoro() as any);
        }
    }, [activeTask, timeRemaining, phase, isRunning, dispatch]);

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