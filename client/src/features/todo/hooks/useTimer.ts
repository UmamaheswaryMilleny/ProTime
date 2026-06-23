import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    resetTimer,
    setPhase,
    completeActivePomodoro
} from '../store/pomodoroSlice';
import type { TodoItem } from '../types/todo.types';
import type { TimerPhase } from '../store/pomodoroSlice';
import { socketService } from '../../../shared/services/socketService';

interface UseTimerProps {
    task?: TodoItem | null;
    timerKey?: string;
    onComplete?: (totalPausedSeconds: number) => void;
}

export const getPhaseSequence = (task: TodoItem | null, isSmartBreaksEnabled: boolean) => {
    if (!task) return [{ phase: 'FOCUS' as TimerPhase, duration: 25 * 60 }];

    if (!isSmartBreaksEnabled || task.priority === 'LOW') {
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
};

export const useTimer = ({ task }: UseTimerProps) => {
    const dispatch = useAppDispatch();
    const reduxPomodoro = useAppSelector((state) => state.pomodoro);

    const isCurrentTask = reduxPomodoro.activeTask?.id === task?.id;

    const isSmartBreaksEnabled = isCurrentTask
        ? reduxPomodoro.isSmartBreaksEnabled
        : (task?.smartBreaks ?? true);

    const phaseSequence = useMemo(() => {
        return getPhaseSequence(task || null, isSmartBreaksEnabled);
    }, [task, isSmartBreaksEnabled]);

    const currentPhaseIndex = isCurrentTask ? reduxPomodoro.currentPhaseIndex : 0;
    const isRunning = isCurrentTask ? reduxPomodoro.isRunning : false;
    const timeRemaining = isCurrentTask ? reduxPomodoro.timeRemaining : phaseSequence[0].duration;
    const totalPausedSeconds = isCurrentTask ? reduxPomodoro.totalPausedSeconds : 0;
    const currentPhase = isCurrentTask ? reduxPomodoro.phase : 'FOCUS';
    const initialTime = isCurrentTask ? reduxPomodoro.initialTime : phaseSequence[0].duration;

    const start = useCallback((targetTask?: TodoItem) => {
        const taskToStart = targetTask || task;
        if (taskToStart) {
            // Check if this task is already active and paused, then resume it
            if (reduxPomodoro.activeTask?.id === taskToStart.id && !reduxPomodoro.isRunning) {
                dispatch(resumePomodoro());
                const ownConversationId = reduxPomodoro.ownConversationId;
                const conversationType = reduxPomodoro.conversationType;

                if (ownConversationId) {
                    if (conversationType === 'ROOM') {
                        socketService.emit('room:pomodoro:resume', { roomId: ownConversationId });
                    } else if (conversationType === 'DIRECT') {
                        socketService.emit('pomodoro:resume', { conversationId: ownConversationId });
                    }
                }
                return;
            }

            const sequence = getPhaseSequence(taskToStart, isSmartBreaksEnabled);
            const currentSeq = sequence[0];
            
            dispatch(startPomodoro({
                task: taskToStart,
                duration: currentSeq.duration,
                phase: currentSeq.phase,
                isSmartBreaksEnabled,
                currentPhaseIndex: 0
            }));

            const ownConversationId = reduxPomodoro.ownConversationId;
            const conversationType = reduxPomodoro.conversationType;

            if (ownConversationId) {
                if (conversationType === 'ROOM') {
                    socketService.emit('room:pomodoro:start', {
                        roomId: ownConversationId,
                        task: taskToStart,
                        duration: currentSeq.duration,
                        phase: currentSeq.phase,
                        startedByName: 'Host'
                    });
                } else if (conversationType === 'DIRECT') {
                    socketService.emit('pomodoro:start', {
                        conversationId: ownConversationId,
                        task: taskToStart,
                        duration: currentSeq.duration
                    });
                }
            }
        }
    }, [task, isSmartBreaksEnabled, dispatch, reduxPomodoro.ownConversationId, reduxPomodoro.conversationType, reduxPomodoro.activeTask, reduxPomodoro.isRunning]);

    const pause = useCallback(() => {
        dispatch(pausePomodoro());
        const ownConversationId = reduxPomodoro.ownConversationId;
        const conversationType = reduxPomodoro.conversationType;

        if (ownConversationId) {
            if (conversationType === 'ROOM') {
                socketService.emit('room:pomodoro:pause', { roomId: ownConversationId });
            } else if (conversationType === 'DIRECT') {
                socketService.emit('pomodoro:pause', { conversationId: ownConversationId });
            }
        }
    }, [dispatch, reduxPomodoro.ownConversationId, reduxPomodoro.conversationType]);

    const resume = useCallback(() => {
        dispatch(resumePomodoro());
        const ownConversationId = reduxPomodoro.ownConversationId;
        const conversationType = reduxPomodoro.conversationType;

        if (ownConversationId) {
            if (conversationType === 'ROOM') {
                socketService.emit('room:pomodoro:resume', { roomId: ownConversationId });
            } else if (conversationType === 'DIRECT') {
                socketService.emit('pomodoro:resume', { conversationId: ownConversationId });
            }
        }
    }, [dispatch, reduxPomodoro.ownConversationId, reduxPomodoro.conversationType]);

    const reset = useCallback(() => {
        dispatch(resetTimer());
    }, [dispatch]);

    const skipBreak = useCallback(() => {
        const nextIndex = currentPhaseIndex + 1;
        if (nextIndex < phaseSequence.length) {
            const nextPhase = phaseSequence[nextIndex];
            dispatch(setPhase({
                phase: nextPhase.phase,
                duration: nextPhase.duration,
                currentPhaseIndex: nextIndex
            }));
        } else {
            dispatch(completeActivePomodoro() as any);
        }
    }, [phaseSequence, currentPhaseIndex, dispatch]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        timeRemaining,
        timeRemainingFormatted: formatTime(timeRemaining),
        isRunning,
        phase: currentPhase,
        initialTime,
        isSmartBreaksEnabled,
        totalPausedSeconds,
        start,
        pause,
        resume,
        reset,
        skipBreak
    };
};
