import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTodayEvents } from '../store/calendarSlice';
import { addNotification } from '../../notifications/store/notificationSlice';
import { getTodayLocalDate } from '../../../shared/utils/dateUtils';
import type { CalendarEvent } from '../types/calendar.types';

const REMINDER_MINUTES = 5;

export const useSessionReminder = () => {
  const dispatch = useAppDispatch();
  const { todayEvents } = useAppSelector(state => state.calendar);
  const notifiedSessionsRef = useRef<Map<string, string>>(new Map());

  // 1. Initialize and prune notified sessions from localStorage
  useEffect(() => {
    try {
      // Clean up legacy localStorage key if present
      localStorage.removeItem('protime_notified_sessions');

      const stored = JSON.parse(localStorage.getItem('protime_notified_sessions_v2') || '[]') as { id: string; scheduledAt: string }[];
      const now = new Date();
      
      // Keep only sessions scheduled within the last 12 hours or in the future
      const valid = stored.filter(item => {
        const scheduled = new Date(item.scheduledAt);
        return (now.getTime() - scheduled.getTime()) < 12 * 60 * 60 * 1000;
      });

      valid.forEach(item => notifiedSessionsRef.current.set(item.id, item.scheduledAt));
      
      const serialized = Array.from(notifiedSessionsRef.current.entries()).map(([id, scheduledAt]) => ({ id, scheduledAt }));
      localStorage.setItem('protime_notified_sessions_v2', JSON.stringify(serialized));
    } catch (e) {
      console.error('Failed to initialize or prune session reminders', e);
    }
  }, []);

  // 2. Fetch today's events on mount or when returning to app
  useEffect(() => {
    const today = getTodayLocalDate();
    dispatch(fetchTodayEvents({ from: today, to: today }));

    const focusHandler = () => {
      const currentToday = getTodayLocalDate();
      dispatch(fetchTodayEvents({ from: currentToday, to: currentToday }));
    };
    
    window.addEventListener('focus', focusHandler);
    return () => window.removeEventListener('focus', focusHandler);
  }, [dispatch]);

  // 3. Poll every minute to check if any session is coming up within 5 mins
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const sessions = todayEvents.filter((e: CalendarEvent) => e.type === 'SESSION' && e.session?.status === 'PLANNED');

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
          notifiedSessionsRef.current.set(sessionId, event.session.scheduledAt);
          
          dispatch(addNotification({
            type: 'session_reminder',
            title: '⏳ Upcoming Session!',
            message: `${event.title} is starting in less than 5 minutes! Get ready.`,
            metadata: { sessionId }
          }));

          // Persist the notified IDs
          const serialized = Array.from(notifiedSessionsRef.current.entries()).map(([id, sAt]) => ({ id, scheduledAt: sAt }));
          localStorage.setItem('protime_notified_sessions_v2', JSON.stringify(serialized));
        }
      });
    };

    // Check immediately and then every 1 minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [todayEvents, dispatch]);
};
