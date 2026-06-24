import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { 
    startPomodoro, 
    pausePomodoro, 
    resumePomodoro, 
    stopPomodoro, 
    setMinimized,
    setPhase,
    completeActivePomodoro,
    resetTimer
} from '../store/pomodoroSlice';
import type { TodoItem } from '../types/todo.types';
import { socketService } from '../../../shared/services/socketService';
import toast from 'react-hot-toast';

export const usePomodoro = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        activeTask, 
        timeRemaining, 
        isRunning, 
        isMinimized, 
        phase, 
        initialTime,
        totalPausedSeconds,
        isLoadingCompletion,
        ownConversationId,
        isSmartBreaksEnabled
    } = useSelector((state: RootState) => state.pomodoro);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const start = (task: TodoItem, duration: number, conversationId?: string, buddyName?: string) => {
        // Guard against starting if a local storage TodoPage timer is running
        const localActiveTaskId = localStorage.getItem('pomodoro_activeTaskId');
        if (localActiveTaskId) {
            const isLocalRunning = localStorage.getItem(`pomodoro_${localActiveTaskId}_isRunning`) === 'true';
            if (isLocalRunning) {
                const localTitle = localStorage.getItem('pomodoro_activeTaskTitle') || 'another task';
                toast.error(`A Pomodoro is already running for "${localTitle}". Stop it to start a new one.`);
                return;
            }
        }

        dispatch(startPomodoro({ 
            task, 
            duration, 
            phase: 'FOCUS', 
            isSmartBreaksEnabled: true,
            conversationId,
            conversationType: 'DIRECT',
            completedWithBuddyName: buddyName || null
        }));
        if (conversationId) {
            socketService.emit('pomodoro:start', { conversationId, task, duration });
        }
    };

    const pause = (conversationId?: string) => {
        dispatch(pausePomodoro());
        if (conversationId) {
            socketService.emit('pomodoro:pause', { conversationId });
        }
    };

    const resume = (conversationId?: string) => {
        dispatch(resumePomodoro());
        if (conversationId) {
            socketService.emit('pomodoro:resume', { conversationId });
        }
    };

    const stop = (conversationId?: string) => {
        dispatch(stopPomodoro());
        if (conversationId) {
            socketService.emit('pomodoro:stop', { conversationId });
        }
    };

    const minimize = () => dispatch(setMinimized(true));
    const maximize = () => dispatch(setMinimized(false));

    const skipBreak = () => {
        dispatch(setPhase({ phase: 'FOCUS', duration: 25 * 60 }));
    };

    const complete = () => {
        return dispatch(completeActivePomodoro());
    };

    const reset = () => {
        dispatch(resetTimer());
    };

    return {
        activeTask,
        timeRemaining,
        timeRemainingFormatted: formatTime(timeRemaining),
        isRunning,
        isMinimized,
        phase,
        initialTime,
        totalPausedSeconds,
        isLoadingCompletion,
        ownConversationId,
        start,
        pause,
        resume,
        stop,
        minimize,
        maximize,
        complete,
        skipBreak,
        reset,
        isSmartBreaksEnabled
    };
};
