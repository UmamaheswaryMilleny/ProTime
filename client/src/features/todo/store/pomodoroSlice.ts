import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { TodoItem } from '../types/todo.types';
import { todoService } from '../services/todo.service';
import { updateGamificationLocal, addBadgeNotification } from '../../gamification/store/gamificationSlice';
import { addNotification } from '../../notifications/store/notificationSlice';
import toast from 'react-hot-toast';

export type TimerPhase = 'FOCUS' | 'BREAK';

interface PomodoroState {
    activeTask: TodoItem | null;
    timeRemaining: number;
    isRunning: boolean;
    isMinimized: boolean;
    phase: TimerPhase;
    initialTime: number;
    isSmartBreaksEnabled: boolean;
    totalPausedSeconds: number;
    isLoadingCompletion: boolean;
    lastCompletedTask: TodoItem | null;
    earnedXp: number;
    showCompletedModal: boolean;
    // Buddy Pomodoro State
    buddyActiveTask: TodoItem | null;
    buddyTimeRemaining: number;
    buddyIsRunning: boolean;
    buddyPhase: TimerPhase;
    buddyConversationId: string | null;
    ownConversationId: string | null;
    lastUpdatedAt: number;
}

const initialState: PomodoroState = {
    activeTask: null,
    timeRemaining: 0,
    isRunning: false,
    isMinimized: false,
    phase: 'FOCUS',
    initialTime: 0,
    isSmartBreaksEnabled: true,
    totalPausedSeconds: 0,
    isLoadingCompletion: false,
    lastCompletedTask: null,
    earnedXp: 0,
    showCompletedModal: false,
    buddyActiveTask: null,
    buddyTimeRemaining: 0,
    buddyIsRunning: false,
    buddyPhase: 'FOCUS',
    buddyConversationId: null,
    ownConversationId: null,
    lastUpdatedAt: 0,
};
const loadState = (): PomodoroState => {
    try {
        const serializedState = localStorage.getItem('protime_pomodoro_state');
        if (serializedState === null) {
            return initialState;
        }
        const state = JSON.parse(serializedState);
        
        // Drift correction: if it was running, adjust timeRemaining
        if (state.isRunning && state.activeTask && state.lastUpdatedAt) {
            const now = Date.now();
            const driftSeconds = Math.floor((now - state.lastUpdatedAt) / 1000);
            
            if (state.timeRemaining > 0) {
                state.timeRemaining = Math.max(0, state.timeRemaining - driftSeconds);
            } else if (state.timeRemaining === 0 && state.phase === 'FOCUS') {
                // If it already finished while closed, we'll keep it at 0
                // The DashboardLayout will handle completion on mount
            }
        }
        
        return {
            ...initialState,
            ...state,
            lastUpdatedAt: Date.now()
        };
    } catch (err) {
        return initialState;
    }
};

const saveState = (state: PomodoroState) => {
    try {
        const serializedState = JSON.stringify({
            ...state,
            lastUpdatedAt: Date.now()
        });
        localStorage.setItem('protime_pomodoro_state', serializedState);
    } catch {
        // Ignore write errors
    }
};

export const completeActivePomodoro = createAsyncThunk(
    'pomodoro/complete',
    async (_, { getState, dispatch }) => {
        const state = (getState() as any).pomodoro as PomodoroState;
        const task = state.activeTask;
        if (!task || task.status === 'COMPLETED') return null;

        try {
            const pomodoroTimeSeconds = state.initialTime;
            const totalPausedSeconds = state.totalPausedSeconds;
            const actualPomodoroTime = Math.floor((pomodoroTimeSeconds - totalPausedSeconds) / 60);

            // 1. Complete Pomodoro session
            await todoService.completePomodoro(task.id, Math.max(0, actualPomodoroTime));

            // 2. Automatically complete the task itself
            const { xpResult } = await todoService.completeTodo(task.id);
            const earnedXp = xpResult.xpAwarded;

            toast.success(`Pomodoro & Task Complete! Earned ${earnedXp}XP`, {
                icon: '🚀',
                duration: 5000
            });

            // Show badge notifications
            if (xpResult.newBadges?.length > 0) {
                xpResult.newBadges.forEach((badge: any) => {
                    dispatch(addBadgeNotification(badge));
                });
            }

            // Update local XP state
            dispatch(updateGamificationLocal({
                totalXp: xpResult.totalXp,
                currentLevel: xpResult.currentLevel,
                currentTitle: xpResult.currentTitle
            }));

            // Notifications
            dispatch(addNotification({
                type: 'task_completed',
                title: '🏆 Task Completed',
                message: `"${task.title}" completed with Pomodoro! +${earnedXp} XP`,
                metadata: { taskId: task.id, xpAwarded: earnedXp },
            }));

            if (earnedXp > 0) {
                dispatch(addNotification({
                    type: 'xp_gained',
                    title: '⭐ XP Earned',
                    message: `+${earnedXp} XP from Pomodoro session. Total: ${xpResult.totalXp} XP`,
                    metadata: { xpAwarded: earnedXp, totalXp: xpResult.totalXp },
                }));
            }

            if (xpResult.leveledUp) {
                toast.success(`🎉 Level Up! You are now Level ${xpResult.currentLevel}: ${xpResult.currentTitle}`, {
                    duration: 7000,
                    icon: '🎊'
                });
                dispatch(addNotification({
                    type: 'level_up',
                    title: '🎉 Level Up!',
                    message: `You reached Level ${xpResult.currentLevel}: ${xpResult.currentTitle}`,
                    metadata: { newLevel: xpResult.currentLevel, newTitle: xpResult.currentTitle },
                }));
            }

            return { task, earnedXp };
        } catch (error) {
            toast.error('Failed to complete pomodoro task');
            throw error;
        }
    }
);

const pomodoroSlice = createSlice({
    name: 'pomodoro',
    initialState: loadState(),
    reducers: {
        startPomodoro: (state, action: PayloadAction<{ 
            task: TodoItem; 
            duration: number; 
            phase: TimerPhase;
            isSmartBreaksEnabled: boolean;
            conversationId?: string;
        }>) => {
            state.activeTask = action.payload.task;
            state.timeRemaining = action.payload.duration;
            state.initialTime = action.payload.duration;
            state.phase = action.payload.phase;
            state.isSmartBreaksEnabled = action.payload.isSmartBreaksEnabled;
            state.isRunning = true;
            state.isMinimized = false;
            state.totalPausedSeconds = 0;
            state.ownConversationId = action.payload.conversationId || null;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        tick: (state) => {
            const now = Date.now();
            let changed = false;

            if (state.activeTask) {
                if (state.isRunning && state.timeRemaining > 0) {
                    state.timeRemaining -= 1;
                    changed = true;
                } else if (!state.isRunning && state.timeRemaining > 0 && state.timeRemaining < state.initialTime) {
                    state.totalPausedSeconds += 1;
                    changed = true;
                }
            }

            if (state.buddyActiveTask && state.buddyIsRunning && state.buddyTimeRemaining > 0) {
                state.buddyTimeRemaining -= 1;
                changed = true;
            }

            if (changed) {
                state.lastUpdatedAt = now;
                saveState(state);
            }
        },
        setRunning: (state, action: PayloadAction<boolean>) => {
            state.isRunning = action.payload;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        pausePomodoro: (state) => {
            state.isRunning = false;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        resumePomodoro: (state) => {
            state.isRunning = true;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        resetTimer: (state) => {
            state.timeRemaining = state.initialTime;
            state.isRunning = false;
            state.totalPausedSeconds = 0;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        setMinimized: (state, action: PayloadAction<boolean>) => {
            state.isMinimized = action.payload;
            saveState(state);
        },
        setPhase: (state, action: PayloadAction<{ phase: TimerPhase; duration: number }>) => {
            state.phase = action.payload.phase;
            state.timeRemaining = action.payload.duration;
            state.initialTime = action.payload.duration;
            state.totalPausedSeconds = 0;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        stopPomodoro: (state) => {
            state.activeTask = null;
            state.timeRemaining = 0;
            state.isRunning = false;
            state.isMinimized = false;
            state.totalPausedSeconds = 0;
            state.ownConversationId = null;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        updateTime: (state, action: PayloadAction<number>) => {
            state.timeRemaining = action.payload;
        },
        dismissCompletedModal: (state) => {
            state.showCompletedModal = false;
            state.lastCompletedTask = null;
            state.earnedXp = 0;
        },
        setBuddyPomodoro: (state, action: PayloadAction<{ 
            conversationId: string; 
            task?: TodoItem; 
            timeRemaining?: number; 
            isRunning?: boolean; 
            phase?: TimerPhase;
            type: 'START' | 'TICK' | 'PAUSE' | 'RESUME' | 'STOP'
        }>) => {
            const { conversationId, task, timeRemaining, phase, type } = action.payload;
            state.buddyConversationId = conversationId;
            
            if (type === 'START') {
                state.buddyActiveTask = task || null;
                state.buddyTimeRemaining = timeRemaining || 0;
                state.buddyIsRunning = true;
                state.buddyPhase = phase || 'FOCUS';
            } else if (type === 'TICK') {
                state.buddyTimeRemaining = timeRemaining || 0;
                state.buddyIsRunning = true;
                state.buddyConversationId = conversationId;
                // If we don't have the task yet, we'll just show the time
            } else if (type === 'PAUSE') {
                state.buddyIsRunning = false;
            } else if (type === 'RESUME') {
                state.buddyIsRunning = true;
            } else if (type === 'STOP') {
                state.buddyActiveTask = null;
                state.buddyConversationId = null;
            }
            state.lastUpdatedAt = Date.now();
            saveState(state);
        },
        clearBuddyPomodoro: (state) => {
            state.buddyActiveTask = null;
            state.buddyConversationId = null;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(completeActivePomodoro.pending, (state) => {
            state.isLoadingCompletion = true;
        });
        builder.addCase(completeActivePomodoro.fulfilled, (state, action) => {
            state.isLoadingCompletion = false;
            if (action.payload) {
                state.lastCompletedTask = action.payload.task;
                state.earnedXp = action.payload.earnedXp;
                state.showCompletedModal = true;
            }
            state.activeTask = null;
            state.isRunning = false;
            state.isMinimized = false;
            state.lastUpdatedAt = Date.now();
            saveState(state);
        });
        builder.addCase(completeActivePomodoro.rejected, (state) => {
            state.isLoadingCompletion = false;
        });
    }
});

export const { 
    startPomodoro, 
    tick, 
    setRunning, 
    setMinimized, 
    setPhase, 
    stopPomodoro,
    updateTime,
    dismissCompletedModal,
    setBuddyPomodoro,
    clearBuddyPomodoro,
    pausePomodoro,
    resumePomodoro,
    resetTimer
} = pomodoroSlice.actions;

export default pomodoroSlice.reducer;
