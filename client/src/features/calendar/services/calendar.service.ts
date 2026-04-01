import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import type { CalendarEvent, DayDetail, PendingScheduleRequest, RespondRequestPayload } from '../types/calendar.types';

export const calendarService = {
  // ─── GET Calendar Events ─────────────────────────────────────────────────
  getCalendarEvents: async (from: string, to: string): Promise<CalendarEvent[]> => {
    const response = await api.get(
      API_ROUTES.CALENDAR_EVENTS,
      { params: { from, to } }
    );
    return response.data.data.events;
  },

  // ─── GET Day Detail ──────────────────────────────────────────────────────
  getDayDetail: async (date: string): Promise<DayDetail> => {
    const response = await api.get(
      API_ROUTES.CALENDAR_DAY(date)
    );
    return response.data.data;
  },

  // ─── GET Pending Schedule Requests ───────────────────────────────────────
  getPendingRequests: async (): Promise<PendingScheduleRequest[]> => {
    const response = await api.get(
      API_ROUTES.CALENDAR_REQUESTS
    );
    return response.data.data;
  },

  // ─── Respond to Schedule Request ─────────────────────────────────────────
  respondToRequest: async (payload: RespondRequestPayload): Promise<PendingScheduleRequest> => {
    const response = await api.patch(
      API_ROUTES.CALENDAR_RESPOND_REQUEST(payload.requestId),
      { status: payload.status }
    );
    return response.data.data;
  },

  // ─── Save Session Notes ──────────────────────────────────────────────────
  saveSessionNotes: async (sessionId: string, notes: string): Promise<any> => {
    const response = await api.post(
      API_ROUTES.CALENDAR_SESSION_NOTES(sessionId),
      { notes }
    );
    return response.data.data;
  },

  // ─── Create Solo Event ───────────────────────────────────────────────────
  createSoloEvent: async (payload: { title: string; date: string; startTime: string }): Promise<CalendarEvent> => {
    const response = await api.post(
      API_ROUTES.CALENDAR_SOLO_EVENT,
      payload
    );
    return response.data.data;
  },
};
