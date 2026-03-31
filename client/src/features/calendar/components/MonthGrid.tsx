import React, { useState, useEffect } from 'react';
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthGrid: React.FC<MonthGridProps> = ({
  events,
  onDateClick,
  onMonthChange,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    // Calculate the start and end dates for the current view
    // E.g., showing some days from previous and next month to fill the grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of this month
    const firstDayOfMonth = new Date(year, month, 1);
    // Move back to the nearest Sunday
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - firstDayOfMonth.getDay());

    // Last day of this month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Move forward to the next Saturday
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    const from = formatLocalDate(startDate);
    const to = formatLocalDate(endDate);

    onMonthChange(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]); // Only trigger onMonthChange when currentDate changes

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const getDaysInGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, 0 - (firstDay.getDay() - 1 - i));
      days.push({ date: d, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }
    // Next month padding
    const remainingSlots = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }
    return days;
  };

  const days = getDaysInGrid();

  const getDayEvents = (dateStr: string) => events.filter((e) => e.date === dateStr);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-zinc-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-zinc-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
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
          className="grid grid-cols-7 gap-2"
        >
          {days.map((dayInfo, idx) => {
            const dateStr = formatLocalDate(dayInfo.date);
            const isSelected = selectedDate === dateStr;
            const isToday = getTodayLocalDate() === dateStr;
            const dayEvents = getDayEvents(dateStr);

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 0.95 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDateClick(dateStr)}
                className={`
                  relative h-24 p-2 rounded-xl flex flex-col items-start justify-start border overflow-hidden
                  transition-all duration-300
                  ${!dayInfo.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                  ${isSelected
                    ? 'border-[blueviolet] bg-[blueviolet]/10 shadow-[0_0_15px_rgba(138,43,226,0.2)]'
                    : isToday
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/5 bg-zinc-800/20 hover:bg-zinc-800/50'
                  }
                `}
              >
                <div className={`text-sm font-medium mb-1 ${isSelected || isToday ? 'text-white' : 'text-zinc-400'}`}>
                  {dayInfo.date.getDate()}
                </div>

                {/* Event Indicators Container */}
                <div className="flex flex-col gap-1 w-full mt-auto">
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
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
