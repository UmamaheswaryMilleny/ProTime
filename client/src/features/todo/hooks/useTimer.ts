import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { TodoItem } from '../types/todo.types';

interface UseTimerProps {
    task?: TodoItem | null;
    timerKey?: string; // Key to persist state
    onComplete?: () => void;
}

export type TimerPhase = 'FOCUS' | 'BREAK';
export interface PhaseConfig {
    phase: TimerPhase;
    duration: number; // in seconds
}

export const useTimer = ({ task, timerKey, onComplete }: UseTimerProps) => {

    const [isSmartBreaksEnabled] = useState<boolean>(() => {
        if (!timerKey) return task?.smartBreaks ?? true;
        const saved = localStorage.getItem(`${timerKey}_smartBreaks`);
        return saved ? saved === 'true' : (task?.smartBreaks ?? true);
    });

    const phaseSequence = useMemo<PhaseConfig[]>(() => {
        if (!task) return [{ phase: 'FOCUS', duration: 25 * 60 }];

        // If smart breaks are disabled, or priority is LOW, it's a single continuous focus block
        if (!isSmartBreaksEnabled || task.priority === 'LOW') {
            return [{ phase: 'FOCUS', duration: task.estimatedTime * 60 }];
        }

        if (task.priority === 'MEDIUM') {
            const focusDuration = task.estimatedTime * 60;
            const breakDuration = Math.round(task.estimatedTime * 0.2) * 60;
            return [
                { phase: 'FOCUS', duration: focusDuration },
                { phase: 'BREAK', duration: breakDuration }
            ];
        }

        if (task.priority === 'HIGH') {
            const sequence: PhaseConfig[] = [];
            let remainingMinutes = task.estimatedTime;

            // Split High priority into 50m focus / 10m break cycles
            while (remainingMinutes > 0) {
                if (remainingMinutes >= 60) {
                    sequence.push({ phase: 'FOCUS', duration: 50 * 60 });
                    sequence.push({ phase: 'BREAK', duration: 10 * 60 });
                    remainingMinutes -= 60;
                } else {
                    sequence.push({ phase: 'FOCUS', duration: remainingMinutes * 60 });
                    remainingMinutes = 0;
                }
            }
            return sequence;
        }

        return [{ phase: 'FOCUS', duration: task.estimatedTime * 60 }];
    }, [task, isSmartBreaksEnabled]);

    // 2. Initialize State
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
        if (!timerKey) return 0;
        const saved = localStorage.getItem(`${timerKey}_phaseIndex`);
        return saved ? parseInt(saved, 10) : 0;
    });

    const [timeRemaining, setTimeRemaining] = useState<number>(() => {
        if (!timerKey) return phaseSequence[0].duration;
        const savedTime = localStorage.getItem(`${timerKey}_timeRemaining`);
        return savedTime ? parseInt(savedTime, 10) : phaseSequence[0].duration;
    });

    const [isRunning, setIsRunning] = useState<boolean>(() => {
        if (!timerKey) return false;
        return localStorage.getItem(`${timerKey}_isRunning`) === 'true';
    });

    // 3. Sync state when task/timerKey changes
    useEffect(() => {
        if (timerKey && task) {
            const savedIndex = localStorage.getItem(`${timerKey}_phaseIndex`);
            const savedTime = localStorage.getItem(`${timerKey}_timeRemaining`);

            const index = savedIndex ? parseInt(savedIndex, 10) : 0;
            // Bound index in case sequence changed
            const safeIndex = index < phaseSequence.length ? index : 0;

            setCurrentPhaseIndex(safeIndex);

            if (savedTime && index === safeIndex) {
                setTimeRemaining(parseInt(savedTime, 10));
            } else {
                setTimeRemaining(phaseSequence[safeIndex].duration);
            }

            setIsRunning(localStorage.getItem(`${timerKey}_isRunning`) === 'true');
        } else {
            setCurrentPhaseIndex(0);
            setTimeRemaining(phaseSequence[0].duration);
            setIsRunning(false);
        }
    }, [timerKey, task, phaseSequence]);

    // 4. Save to Local Storage
    useEffect(() => {
        if (timerKey) {
            localStorage.setItem(`${timerKey}_phaseIndex`, currentPhaseIndex.toString());
            localStorage.setItem(`${timerKey}_timeRemaining`, timeRemaining.toString());
            localStorage.setItem(`${timerKey}_isRunning`, isRunning.toString());
            localStorage.setItem(`${timerKey}_smartBreaks`, isSmartBreaksEnabled.toString());
        }
    }, [currentPhaseIndex, timeRemaining, isRunning, isSmartBreaksEnabled, timerKey]);

    const playSoftBeep = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note

            // Envelope for a soft chime
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (err) {
            // Audio context not supported or failed
        }
    }, []);

    // 5. Timer Interval & Phase Transitions
    useEffect(() => {
        let interval: number;
        if (isRunning && timeRemaining > 0) {
            interval = window.setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (isRunning && timeRemaining === 0) {
            setIsRunning(false);

            const completingPhase = phaseSequence[currentPhaseIndex].phase;
            if (completingPhase === 'BREAK') {
                playSoftBeep();
                toast('Ready to continue?', { icon: '🔄', duration: 4000 });
            } else if (completingPhase === 'FOCUS' && currentPhaseIndex < phaseSequence.length - 1) {
                // Focus ended, break starting
                playSoftBeep();
                toast.success('Break Time! Relax your eyes.', { duration: 4000 });
            }

            const nextIndex = currentPhaseIndex + 1;
            if (nextIndex < phaseSequence.length) {
                // Transition to next phase
                setCurrentPhaseIndex(nextIndex);
                setTimeRemaining(phaseSequence[nextIndex].duration);
                // Auto-start next phase after a tiny delay
                setTimeout(() => setIsRunning(true), 200);
            } else {
                // All phases complete
                onComplete?.();
            }
        }
        return () => window.clearInterval(interval);
    }, [isRunning, timeRemaining, currentPhaseIndex, phaseSequence, onComplete]);

    // 6. Controls
    const start = useCallback(() => setIsRunning(true), []);
    const pause = useCallback(() => setIsRunning(false), []);
    const reset = useCallback(() => {
        setIsRunning(false);
        setCurrentPhaseIndex(0);
        setTimeRemaining(phaseSequence[0].duration);
        if (timerKey) {
            localStorage.removeItem(`${timerKey}_phaseIndex`);
            localStorage.removeItem(`${timerKey}_timeRemaining`);
            localStorage.removeItem(`${timerKey}_isRunning`);
        }
    }, [phaseSequence, timerKey]);

    const skipBreak = useCallback(() => {
        if (phaseSequence[currentPhaseIndex]?.phase === 'BREAK') {
            setIsRunning(false);
            setTimeRemaining(0); // Trigger transition on next render
            setTimeout(() => setIsRunning(true), 100);
        }
    }, [phaseSequence, currentPhaseIndex]);


    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const currentPhase = phaseSequence[currentPhaseIndex]?.phase || 'FOCUS';
    const initialTime = phaseSequence[currentPhaseIndex]?.duration || 0;

    return {
        timeRemaining,
        timeRemainingFormatted: formatTime(timeRemaining),
        isRunning,
        phase: currentPhase,
        initialTime,
        isSmartBreaksEnabled,
        start,
        pause,
        reset,
        skipBreak
    };
};
