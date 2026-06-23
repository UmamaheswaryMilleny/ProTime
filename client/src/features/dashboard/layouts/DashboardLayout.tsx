import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useChatSocket } from '../../chat/hooks/useChatSocket';
import { VideoCallOverlay } from '../../chat/components/VideoCallManager';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store/store';
import { socketService } from '../../../shared/services/socketService';
import { useSessionReminder } from '../../calendar/hooks/useSessionReminder';
import { tick, completeActivePomodoro, setPhase, stopPomodoro } from '../../todo/store/pomodoroSlice';
import type { TimerPhase } from '../../todo/store/pomodoroSlice';
import type { TodoItem } from '../../todo/types/todo.types';
import toast from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

export const DashboardLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.auth.user);
    const { 
        activeTask, isRunning, timeRemaining, phase, ownConversationId,
        conversationType, isRoomHost, buddyActiveTask, buddyIsRunning,
        currentPhaseIndex, isSmartBreaksEnabled
    } = useAppSelector((state: RootState) => state.pomodoro);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('protime_sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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
                
                // Emit tick to sync with buddy or room every 5 seconds if WE are the one running the timer
                if (activeTask && isRunning && timeRemaining % 5 === 0 && ownConversationId) {
                    if (conversationType === 'ROOM' && isRoomHost) {
                        socketService.emit('room:pomodoro:tick', {
                            roomId: ownConversationId,
                            timeRemaining,
                            phase
                        });
                    } else if (conversationType === 'DIRECT') {
                        socketService.emit('pomodoro:tick', { 
                            conversationId: ownConversationId, 
                            timeRemaining 
                        });
                    }
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
    }, [activeTask, isRunning, timeRemaining, buddyActiveTask, buddyIsRunning, dispatch, ownConversationId, conversationType, isRoomHost, phase]);

    // Helper to calculate phase sequence based on priority
    const getPhaseSequence = React.useCallback((task: TodoItem | null, smartBreaks: boolean) => {
        if (!task) return [{ phase: 'FOCUS' as TimerPhase, duration: 25 * 60 }];

        if (!smartBreaks || task.priority === 'LOW') {
            const focusMinutes = task.estimatedTime;
            return [{ phase: 'FOCUS' as TimerPhase, duration: focusMinutes * 60 }];
        }

        if (task.priority === 'MEDIUM') {
            const focusDuration = task.estimatedTime * 60;
            const breakDuration = Math.round(task.estimatedTime * 0.2) * 60;
            return [
                { phase: 'FOCUS' as TimerPhase, duration: focusDuration },
                { phase: 'BREAK' as TimerPhase, duration: breakDuration }
            ];
        }

        if (task.priority === 'HIGH') {
            const sequence: { phase: TimerPhase; duration: number }[] = [];
            let remainingMinutes = task.estimatedTime;

            while (remainingMinutes > 0) {
                if (remainingMinutes >= 60) {
                    sequence.push({ phase: 'FOCUS' as TimerPhase, duration: 50 * 60 });
                    sequence.push({ phase: 'BREAK' as TimerPhase, duration: 10 * 60 });
                    remainingMinutes -= 60;
                } else {
                    sequence.push({ phase: 'FOCUS' as TimerPhase, duration: remainingMinutes * 60 });
                    remainingMinutes = 0;
                }
            }
            return sequence;
        }

        return [{ phase: 'FOCUS' as TimerPhase, duration: task.estimatedTime * 60 }];
    }, []);

    const playSoftBeep = React.useCallback(() => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch {
            // silently fail
        }
    }, []);

    // Global Completion and Phase Transition Logic
    React.useEffect(() => {
        if (activeTask && timeRemaining === 0 && isRunning) {
            const phaseSequence = getPhaseSequence(activeTask, isSmartBreaksEnabled);
            const nextIndex = currentPhaseIndex + 1;

            if (nextIndex < phaseSequence.length) {
                const nextPhase = phaseSequence[nextIndex];
                playSoftBeep();
                if (nextPhase.phase === 'BREAK') {
                    toast.success('Break Time! Relax your eyes.', { duration: 4000 });
                } else {
                    toast('Ready to continue?', { icon: '🔄', duration: 4000 });
                }
                
                dispatch(setPhase({
                    phase: nextPhase.phase,
                    duration: nextPhase.duration,
                    currentPhaseIndex: nextIndex
                }));

                // Relay phase start to room/buddy if connected
                if (ownConversationId) {
                    if (conversationType === 'ROOM' && isRoomHost) {
                        socketService.emit('room:pomodoro:start', {
                            roomId: ownConversationId,
                            task: activeTask,
                            duration: nextPhase.duration,
                            phase: nextPhase.phase,
                            startedByName: user?.fullName || 'Host'
                        });
                    } else if (conversationType === 'DIRECT') {
                        socketService.emit('pomodoro:start', { 
                            conversationId: ownConversationId, 
                            task: activeTask,
                            duration: nextPhase.duration 
                        });
                    }
                }
            } else {
                if (phase === 'FOCUS') {
                    dispatch(completeActivePomodoro() as any);
                } else {
                    dispatch(stopPomodoro());
                    if (ownConversationId) {
                        if (conversationType === 'ROOM') {
                            socketService.emit('room:pomodoro:stop', { roomId: ownConversationId });
                        } else if (conversationType === 'DIRECT') {
                            socketService.emit('pomodoro:stop', { conversationId: ownConversationId });
                        }
                    }
                }
            }
        }
    }, [activeTask, timeRemaining, phase, isRunning, isSmartBreaksEnabled, currentPhaseIndex, dispatch, playSoftBeep, ownConversationId, conversationType, isRoomHost, user?.fullName, getPhaseSequence]);

    React.useEffect(() => {
        localStorage.setItem('protime_sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col lg:block">
            {/* Mobile Header */}
            <header className="lg:hidden bg-zinc-900 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="text-xl font-bold flex items-center gap-1">
                    <span className="text-[blueviolet]">Pro</span>
                    <span className="text-white">Time</span>
                </div>
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Backdrop */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden" 
                    onClick={() => setIsMobileOpen(false)} 
                />
            )}

            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                isMobileOpen={isMobileOpen}
                closeMobileSidebar={() => setIsMobileOpen(false)}
            />

            {/* Main Content — left margin matches sidebar width on desktop */}
            <main className={`min-h-screen flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Outlet />
            </main>

            {/* Global Video Call Overlay */}
            <VideoCallOverlay />
        </div>
    );
};