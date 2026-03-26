import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchCalendarEvents,
  fetchDayDetail,
  fetchPendingRequests,
  respondToScheduleRequest,
  clearCalendarError,
  clearSelectedDateDetails,
} from '../store/calendarSlice';

import { MonthGrid } from '../components/MonthGrid';
import { DayDetailPanel } from '../components/DayDetailPanel';
import { ScheduleRequestsView } from '../components/ScheduleRequestsView';
import type { RespondRequestPayload } from '../types/calendar.types';

export const CalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    events,
    selectedDateDetails,
    pendingRequests,
    isLoadingEvents,
    isLoadingDayDetail,
    isLoadingRequests,
    isResponding,
    error,
  } = useAppSelector((state) => state.calendar);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Initialize: Fetch requests on mount
  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  // Handle global error toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCalendarError());
    }
  }, [error, dispatch]);

  const handleMonthChange = useCallback((from: string, to: string) => {
    dispatch(fetchCalendarEvents({ from, to }));
  }, [dispatch]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    dispatch(fetchDayDetail(date));
  };

  const closePanel = () => {
    setSelectedDate(null);
    dispatch(clearSelectedDateDetails());
  };

  const handleRespond = async (payload: RespondRequestPayload) => {
    const result = await dispatch(respondToScheduleRequest(payload));
    if (respondToScheduleRequest.fulfilled.match(result)) {
      toast.success(`Schedule request ${payload.status.toLowerCase()} successfully.`);
      
      // If we confirmed a request and it's visible in our current date range, 
      // we might want to refetch events to show the new session.
      // Easiest is to just refetch the events for the current month if needed, 
      // but without the 'from'/'to' bounds, it's safer to let the user navigate 
      // or we can dispatch fetch events if we track bounds in state.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-[blueviolet] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(138,43,226,0.5)]">
            Calendar
          </h1>
          <p className="text-zinc-400 mt-2 font-medium">Keep track of your schedule, tasks, and study sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Calendar View */}
        <div className="xl:col-span-2 relative">
          {isLoadingEvents && events.length === 0 && (
            <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[blueviolet] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <MonthGrid
            events={events}
            onDateClick={handleDateClick}
            onMonthChange={handleMonthChange}
            selectedDate={selectedDate}
          />
        </div>

        {/* Schedule Requests Sidebar block */}
        <div className="xl:col-span-1">
          {isLoadingRequests && pendingRequests.length === 0 ? (
             <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[blueviolet] border-t-transparent rounded-full animate-spin" />
             </div>
          ) : (
            <ScheduleRequestsView
              requests={pendingRequests}
              onRespond={handleRespond}
              isResponding={isResponding}
            />
          )}
        </div>
      </div>

      {/* Floating Day Detail Panel */}
      <DayDetailPanel
        isOpen={selectedDate !== null}
        onClose={closePanel}
        dayDetail={selectedDateDetails}
        isLoading={isLoadingDayDetail}
      />
    </motion.div>
  );
};
