import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { calendarService } from '../services/calendar.service';
import type { CalendarEvent, DayDetail, PendingScheduleRequest, RespondRequestPayload } from '../types/calendar.types';

interface CalendarState {
  events: CalendarEvent[];
  selectedDateDetails: DayDetail | null;
  pendingRequests: PendingScheduleRequest[];
  
  // Loading states
  isLoadingEvents: boolean;
  isLoadingDayDetail: boolean;
  isLoadingRequests: boolean;
  isResponding: boolean;

  // Error states
  error: string | null;
}

const initialState: CalendarState = {
  events: [],
  selectedDateDetails: null,
  pendingRequests: [],

  isLoadingEvents: false,
  isLoadingDayDetail: false,
  isLoadingRequests: false,
  isResponding: false,

  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchCalendarEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async ({ from, to }: { from: string; to: string }, { rejectWithValue }) => {
    try {
      return await calendarService.getCalendarEvents(from, to);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar events');
    }
  }
);

export const fetchDayDetail = createAsyncThunk(
  'calendar/fetchDayDetail',
  async (date: string, { rejectWithValue }) => {
    try {
      return await calendarService.getDayDetail(date);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch day detail');
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'calendar/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await calendarService.getPendingRequests();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  }
);

export const respondToScheduleRequest = createAsyncThunk(
  'calendar/respondRequest',
  async (payload: RespondRequestPayload, { rejectWithValue }) => {
    try {
      return await calendarService.respondToRequest(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to request');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    clearCalendarError: (state) => {
      state.error = null;
    },
    clearSelectedDateDetails: (state) => {
      state.selectedDateDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.isLoadingEvents = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.isLoadingEvents = false;
        state.events = action.payload;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.isLoadingEvents = false;
        state.error = action.payload as string;
      })

      // Fetch Day Detail
      .addCase(fetchDayDetail.pending, (state) => {
        state.isLoadingDayDetail = true;
        state.error = null;
      })
      .addCase(fetchDayDetail.fulfilled, (state, action: PayloadAction<DayDetail>) => {
        state.isLoadingDayDetail = false;
        state.selectedDateDetails = action.payload;
      })
      .addCase(fetchDayDetail.rejected, (state, action) => {
        state.isLoadingDayDetail = false;
        state.error = action.payload as string;
      })

      // Fetch Pending Requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.isLoadingRequests = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action: PayloadAction<PendingScheduleRequest[]>) => {
        state.isLoadingRequests = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.error = action.payload as string;
      })

      // Respond to Request
      .addCase(respondToScheduleRequest.pending, (state) => {
        state.isResponding = true;
        state.error = null;
      })
      .addCase(respondToScheduleRequest.fulfilled, (state, action: PayloadAction<PendingScheduleRequest>) => {
        state.isResponding = false;
        // The API returns the updated request (now Confirmed/Rejected). 
        // Remove it from pendingRequests as it's no longer pending.
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload.id);
      })
      .addCase(respondToScheduleRequest.rejected, (state, action) => {
        state.isResponding = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCalendarError, clearSelectedDateDetails } = calendarSlice.actions;
export default calendarSlice.reducer;
