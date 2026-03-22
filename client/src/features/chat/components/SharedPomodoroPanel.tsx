import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { chatApi } from '../api/chatApi';

interface SharedPomodoroPanelProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DURATIONS = [25, 45, 60, 120];

export const SharedPomodoroPanel: React.FC<SharedPomodoroPanelProps> = ({ conversationId, isOpen, onClose }) => {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const activeSession = useSelector((state: RootState) => state.chat.activeSessions[conversationId]);

  useEffect(() => {
    if (!activeSession) {
      setRemainingTime(null);
      setIsEnding(false);
      return;
    }

    const calculateRemaining = () => {
      const startedAtTime = new Date(activeSession.startedAt).getTime();
      const elapsed = (Date.now() - startedAtTime) / 1000;
      const remaining = activeSession.durationMinutes * 60 - elapsed;
      return Math.max(0, Math.floor(remaining));
    };

    setRemainingTime(calculateRemaining());

    const timerInterval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(timerInterval);
        handleEndSession(true);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeSession, conversationId]);

  const handleStartSession = async () => {
    try {
      await chatApi.startSession(conversationId, selectedDuration);
    } catch (error) {
      console.error('Failed to start session', error);
    }
  };

  const handleEndSession = async (auto = false) => {
    if (isEnding) return;
    setIsEnding(true);
    try {
      await chatApi.endSession(conversationId);
      if (!auto) onClose();
    } catch (error) {
      console.error('Failed to end session', error);
      setIsEnding(false);
    }
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="absolute bottom-[72px] left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl border border-gray-100 dark:border-gray-700 p-6 z-10 mx-2 sm:mx-4 animate-slideUp">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Study Pomodoro
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!activeSession ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Select duration to start a shared session</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(dur => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedDuration === dur 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {dur} min
              </button>
            ))}
          </div>
          <button 
            onClick={handleStartSession}
            className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Start Session
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          {remainingTime === 0 ? (
            <div className="text-3xl font-black text-green-500 animate-bounce">
              Time's up! 🎉
            </div>
          ) : (
            <div className="text-5xl font-black font-mono text-gray-800 dark:text-white tracking-widest drop-shadow-sm">
              {remainingTime !== null ? formatTime(remainingTime) : '00:00'}
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Started by {activeSession.startedByName}</p>
            <p className="text-xs text-gray-500 mt-1">Completed: {activeSession.pomodorosCompleted} pomodoros</p>
          </div>

          <button 
            onClick={() => handleEndSession(false)}
            disabled={isEnding}
            className="mt-4 px-6 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg font-medium transition"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  );
};
