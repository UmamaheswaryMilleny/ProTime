import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCalendarEvents } from '../store/calendarSlice';
import { addNotification } from '../../notifications/store/notificationSlice';
import { getTodayLocalDate } from '../../../shared/utils/dateUtils';
import type { CalendarEvent } from '../types/calendar.types';

const REMINDER_MINUTES = 5;

export const useSessionReminder = () => {
  const dispatch = useAppDispatch();
  const { events } = useAppSelector(state => state.calendar);
  const notifiedSessionsRef = useRef<Set<string>>(new Set(
    JSON.parse(localStorage.getItem('protime_notified_sessions') || '[]') as string[]
  ));

  // 1. Fetch today's events on mount or when returning to app
  useEffect(() => {
    const today = getTodayLocalDate();
    dispatch(fetchCalendarEvents({ from: today, to: today }));

    const focusHandler = () => {
      const currentToday = getTodayLocalDate();
      dispatch(fetchCalendarEvents({ from: currentToday, to: currentToday }));
    };
    
    window.addEventListener('focus', focusHandler);
    return () => window.removeEventListener('focus', focusHandler);
  }, [dispatch]);

  // 2. Poll every minute to check if any session is coming up within 5 mins
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const sessions = events.filter((e: CalendarEvent) => e.type === 'SESSION' && e.session?.status === 'PLANNED');

      sessions.forEach(event => {
        if (!event.session) return;
        
        // Ensure we haven't already notified about this particular session schedule
        const sessionId = event.session.id;
        if (notifiedSessionsRef.current.has(sessionId)) return;

        const scheduledAt = new Date(event.session.scheduledAt);
        const diffMs = scheduledAt.getTime() - now.getTime();
        const diffMins = diffMs / 60000;

        // If the session is exactly or under 5 minutes away, and also not already passed by more than 5 minutes
        if (diffMins <= REMINDER_MINUTES && diffMins > -REMINDER_MINUTES) {
          notifiedSessionsRef.current.add(sessionId);
          
          dispatch(addNotification({
            type: 'session_reminder',
            title: '⏳ Upcoming Session!',
            message: `${event.title} is starting in less than 5 minutes! Get ready.`,
            metadata: { sessionId }
          }));
        }
      });

      // Persist the notified IDs
      localStorage.setItem('protime_notified_sessions', JSON.stringify(Array.from(notifiedSessionsRef.current)));
    };

    // Check immediately and then every 1 minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [events, dispatch]);
};
