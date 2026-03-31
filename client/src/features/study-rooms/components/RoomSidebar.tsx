import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { startPomodoro, stopPomodoro, pausePomodoro, resumePomodoro } from '../../todo/store/pomodoroSlice';
import { Timer, Play, Pause, Square, ChevronDown, Bot } from 'lucide-react';
import type { TodoItem } from '../../todo/types/todo.types';

interface RoomSidebarProps {
  isHost: boolean;
  isAiMode?: boolean;
}

export const RoomSidebar: React.FC<RoomSidebarProps> = ({ isHost, isAiMode }) => {
  const dispatch = useAppDispatch();
  const { activeTask, isRunning, timeRemaining, initialTime } = useAppSelector(s => s.pomodoro);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [aiMessage, setAiMessage] = useState('');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = initialTime > 0 ? ((initialTime - timeRemaining) / initialTime) * 100 : 0;

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pr-1">
      {/* ─── Pomodoro Timer Panel ─────────────────────────────────────────── */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Timer size={16} className="text-[blueviolet]" />
          Pomodoro Timer
        </div>

        {activeTask ? (
          <>
            {/* Active task info */}
            <div className="bg-zinc-800 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-0.5">Active Task</p>
              <p className="text-sm text-white font-medium line-clamp-2">{activeTask.title}</p>
            </div>

            {/* Circular progress */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3f3f46" strokeWidth="2" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="blueviolet" strokeWidth="2"
                    strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-mono font-bold text-[blueviolet]">{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => isRunning ? dispatch(pausePomodoro()) : dispatch(resumePomodoro())}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[blueviolet] text-white text-xs font-semibold hover:bg-[blueviolet]/80 transition-colors"
                >
                  {isRunning ? <Pause size={12} /> : <Play size={12} />}
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => dispatch(stopPomodoro())}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold hover:bg-zinc-700 transition-colors border border-white/10"
                >
                  <Square size={12} />
                  Stop
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* No active task — only host can start */}
            {isHost ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-zinc-500 text-center">As the host, you can start a Pomodoro session for everyone</p>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-400 flex-shrink-0">Duration:</label>
                  <div className="relative flex-1">
                    <select
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg py-1.5 pl-2.5 pr-6 text-xs text-zinc-200 focus:outline-none appearance-none"
                    >
                      {[15, 20, 25, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Create a virtual task for the room session
                    const roomTask: TodoItem = {
                      id: `room-${Date.now()}`,
                      title: 'Group Study Session',
                      description: 'Study room Pomodoro',
                      status: 'IN_PROGRESS',
                      priority: 'MEDIUM',
                      estimatedPomodoros: 1,
                      completedPomodoros: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    } as any;
                    dispatch(startPomodoro({
                      task: roomTask,
                      duration: durationMinutes * 60,
                      phase: 'FOCUS',
                      isSmartBreaksEnabled: false,
                    }));
                  }}
                  className="w-full py-2.5 rounded-xl bg-[blueviolet] text-white text-sm font-semibold hover:bg-[blueviolet]/80 transition-colors shadow-lg shadow-[blueviolet]/20 flex items-center justify-center gap-2"
                >
                  <Play size={14} />
                  Start Session
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <Timer size={32} className="text-zinc-700" />
                <button
                  className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-sm font-semibold border border-white/10 cursor-default"
                  disabled
                >
                  Select A Task To Start
                </button>
                <p className="text-[10px] text-zinc-600 text-center">Waiting for the host to start a Pomodoro session</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Bottom Section: ProBuddy AI (Only shows when active) ────────────────── */}
      {isAiMode && (
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 flex-1 min-h-0 relative animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Bot size={16} className="text-[blueviolet]" />
              ProBuddy AI
            </div>
            <span className="text-[10px] bg-[blueviolet]/10 text-[blueviolet] px-2 py-0.5 rounded-full border border-[blueviolet]/20 font-bold animate-pulse">
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {/* Mock AI Messages */}
            <div className="flex flex-col gap-1.5 items-start">
              <div className="bg-zinc-800/80 border border-white/5 rounded-2xl p-3 text-xs text-zinc-300 leading-relaxed rounded-bl-none max-w-[90%] shadow-lg">
                Hello! I'm **ProBuddy**, your AI study assistant. I can help you summarize topics, answer questions, or keep you motivated! 🚀
              </div>
              <span className="text-[9px] text-zinc-600 ml-1">Just now</span>
            </div>

            <div className="flex flex-col gap-1.5 items-end">
              <div className="bg-[blueviolet]/20 border border-[blueviolet]/20 rounded-2xl p-3 text-xs text-zinc-200 leading-relaxed rounded-br-none max-w-[90%] shadow-lg">
                Can you help me understand the difference between SQL and NoSQL?
              </div>
              <span className="text-[9px] text-zinc-600 mr-1">1 min ago</span>
            </div>

            <div className="flex flex-col gap-1.5 items-start">
              <div className="bg-zinc-800/80 border border-white/5 rounded-2xl p-3 text-xs text-zinc-300 leading-relaxed rounded-bl-none max-w-[90%] shadow-lg">
                Of course! Simply put, **SQL** is like a structured spreadsheet with fixed rows/columns, while **NoSQL** is more like a flexible folder with documents... 📚
              </div>
              <span className="text-[9px] text-zinc-600 ml-1">30 sec ago</span>
            </div>
          </div>

          {/* AI Input Area */}
          <div className="pt-2">
            <div className="relative">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask ProBuddy anything..."
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-all border-b-2 border-b-[blueviolet]/30"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[blueviolet] text-white hover:bg-[blueviolet]/80 transition-colors shadow-lg shadow-[blueviolet]/20">
                <Play size={10} className="fill-current" />
              </button>
            </div>
            <p className="text-[9px] text-zinc-500 mt-2 text-center">AI responses may be limited by session length.</p>
          </div>
        </div>
      )}
    </div>
  );
};
