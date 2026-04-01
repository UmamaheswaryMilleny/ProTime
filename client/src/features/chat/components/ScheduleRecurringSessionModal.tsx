import React, { useState, useMemo } from 'react';
import { X, Clock, Calendar, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { chatApi } from '../api/chatApi';
import { formatLocalDate } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';

interface ScheduleRecurringSessionModalProps {
  conversationId: string;
  onClose: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<string, string> = {
  Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat',
};

function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${m} min`;
}

export const ScheduleRecurringSessionModal: React.FC<ScheduleRecurringSessionModalProps> = ({ conversationId, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday']);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [noOfSessions, setNoOfSessions] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationMinutes = useMemo(() => toMinutes(endTime) - toMinutes(startTime), [startTime, endTime]);

  const timeError = useMemo(() => {
    if (durationMinutes <= 0) return 'End time must be after start time';
    if (durationMinutes > 360) return 'Session duration cannot exceed 6 hours';
    return null;
  }, [durationMinutes]);

  const isValid = selectedDays.length > 0 && !timeError;

  const calculatedDates = useMemo(() => {
    if (!isValid) return [];
    
    const dates: string[] = [];
    const now = new Date();
    const curr = new Date();
    curr.setHours(0, 0, 0, 0);

    const targetDayIndices = selectedDays.map(d => DAYS.indexOf(d));
    const [startH, startM] = startTime.split(':').map(Number);
    
    let checkDate = new Date(curr);
    // Limit search to prevent infinite loop just in case
    let attempts = 0;
    while (dates.length < noOfSessions && attempts < 100) {
      if (targetDayIndices.includes(checkDate.getDay())) {
        const scheduledTime = new Date(checkDate);
        scheduledTime.setHours(startH, startM, 0, 0);

        if (scheduledTime.getTime() > now.getTime()) {
          dates.push(formatLocalDate(checkDate));
        }
      }
      checkDate.setDate(checkDate.getDate() + 1);
      attempts++;
    }
    return dates;
  }, [selectedDays, startTime, noOfSessions, isValid]);

  const startDateDisplay = useMemo(() => {
    if (calculatedDates.length === 0) return '';
    const date = new Date(calculatedDates[0] + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }, [calculatedDates]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSendRequest = async () => {
    if (!isValid) return;
    try {
      setIsSubmitting(true);

      await chatApi.proposeRecurringSession(conversationId, {
        days: selectedDays,
        startTime,
        endTime,
        noOfSessions,
        dates: calculatedDates, 
      });
      toast.success('Recurring session request sent! Waiting for buddy to accept.');
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to send schedule request';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10 px-8 pt-8 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[blueviolet]/20 border border-[blueviolet]/30 flex items-center justify-center">
              <RotateCcw size={18} className="text-[blueviolet]" />
            </div>
            <h2 className="text-xl font-bold text-white">Schedule Recurring Session</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed pl-12">
            Repeat study sessions automatically — no need to rematch!
          </p>
        </div>

        <div className="px-8 py-6 space-y-7">
          {/* Choose Days */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-3 uppercase tracking-widest">
              1. Select Days
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[blueviolet] border-[blueviolet] text-white shadow-lg shadow-[blueviolet]/25'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {DAY_SHORT[day]}
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Select at least one day
              </p>
            )}
          </div>

          {/* Time & Sessions */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-3 uppercase tracking-widest">
              2. Set Time & Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-zinc-800/60 border rounded-xl text-sm text-white focus:outline-none transition-all ${
                    timeError ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-700 focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet]'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">No. of Sessions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={noOfSessions}
                  onChange={e => setNoOfSessions(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-all"
                />
              </div>
            </div>

            {/* Time error */}
            {timeError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} />
                {timeError}
              </div>
            )}

            {/* Duration auto-calc */}
            {!timeError && durationMinutes > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <Clock size={12} />
                Session Duration: {formatDuration(durationMinutes)}
              </div>
            )}
          </div>

          {/* Schedule Preview */}
          {isValid && (
            <div className="rounded-xl border border-[blueviolet]/30 bg-[blueviolet]/5 p-4 space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[blueviolet]" />
                Schedule Preview
              </label>
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2 items-start">
                  <Calendar size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-200">
                    <span className="font-semibold text-white">
                      {selectedDays.map(d => DAY_SHORT[d]).join(', ')}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-200">
                    {formatTime(startTime)} – {formatTime(endTime)}{' '}
                    <span className="text-zinc-400">({formatDuration(durationMinutes)})</span>
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <RotateCcw size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-200">
                    <span className="font-semibold text-white">{noOfSessions}</span> total session{noOfSessions !== 1 ? 's' : ''}
                  </span>
                </div>
                {startDateDisplay && (
                  <div className="flex gap-2 items-center text-[blueviolet] font-medium pt-1">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Starts from: {startDateDisplay}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm border-t border-white/10 px-8 py-5 flex gap-3">
          <button
            onClick={handleSendRequest}
            disabled={isSubmitting || !isValid}
            className="flex-1 bg-[blueviolet] hover:bg-[blueviolet]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[blueviolet]/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-bold py-3.5 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
