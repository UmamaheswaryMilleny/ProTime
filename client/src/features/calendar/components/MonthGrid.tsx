import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarEvent } from '../types/calendar.types';
import { formatLocalDate, getTodayLocalDate } from '../../../shared/utils/dateUtils';

interface MonthGridProps {
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  onMonthChange: (from: string, to: string) => void;
  selectedDate: string | null;
}

// Full names for desktop, single letters for mobile
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MonthGrid: React.FC<MonthGridProps> = ({
  events,
  onDateClick,
  onMonthChange,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - firstDayOfMonth.getDay());

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    const from = formatLocalDate(startDate);
    const to = formatLocalDate(endDate);

    onMonthChange(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysList = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, 0 - (firstDay.getDay() - 1 - i));
      daysList.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      daysList.push({ date: d, isCurrentMonth: true });
    }
    const remainingSlots = 42 - daysList.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      daysList.push({ date: d, isCurrentMonth: false });
    }
    return daysList;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((evt) => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [events]);

  const getDayEvents = (dateStr: string) => eventsByDate[dateStr] || [];

  const dayLabels = isMobile ? DAYS_SHORT : DAYS_FULL;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-bold text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-zinc-300"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-zinc-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map((day, i) => (
          <div key={i} className="text-center text-[10px] sm:text-sm font-semibold text-zinc-500 py-1.5 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-0.5 sm:gap-2"
        >
          {days.map((dayInfo, idx) => {
            const dateStr = formatLocalDate(dayInfo.date);
            const isSelected = selectedDate === dateStr;
            const isToday = getTodayLocalDate() === dateStr;
            const dayEvents = getDayEvents(dateStr);

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 0.96 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onDateClick(dateStr)}
                className={`
                  relative h-12 sm:h-24 px-0.5 sm:p-2 rounded-lg sm:rounded-xl flex flex-col items-center sm:items-start justify-start border overflow-hidden
                  transition-all duration-300
                  ${!dayInfo.isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                  ${isSelected
                    ? 'border-[blueviolet] bg-[blueviolet]/10 shadow-[0_0_12px_rgba(138,43,226,0.2)]'
                    : isToday
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/5 bg-zinc-800/20 hover:bg-zinc-800/50'
                  }
                `}
              >
                {/* Date number */}
                <div className={`
                  text-[11px] sm:text-sm font-semibold mt-1 sm:mt-0 sm:mb-1 leading-none
                  ${isSelected ? 'text-[blueviolet]' : isToday ? 'text-white' : 'text-zinc-400'}
                  ${isToday ? 'sm:bg-white/10 sm:rounded-full sm:w-6 sm:h-6 sm:flex sm:items-center sm:justify-center' : ''}
                `}>
                  {dayInfo.date.getDate()}
                </div>

                {/* Event dots on mobile, pills on desktop */}
                {dayEvents.length > 0 && (
                  <>
                    {/* Mobile: colored dots */}
                    <div className="flex sm:hidden items-center justify-center gap-0.5 mt-1 flex-wrap">
                      {dayEvents.slice(0, 3).map((evt, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            evt.type === 'SESSION' ? 'bg-indigo-400' : 'bg-green-400'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Desktop: text pills */}
                    <div className="hidden sm:flex flex-col gap-1 w-full mt-auto">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded-md text-left w-full
                            ${evt.type === 'SESSION' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-500/20 text-green-300'}
                          `}
                        >
                          {evt.startTime} - {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-zinc-500 font-medium px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Mobile legend */}
      <div className="flex sm:hidden items-center gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Session
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Other
        </div>
      </div>
    </div>
  );
};
