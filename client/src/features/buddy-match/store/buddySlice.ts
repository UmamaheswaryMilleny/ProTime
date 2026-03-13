import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { buddyService } from "../services/buddy.service";
import type { 
  BuddyPreference, 
  BuddyProfile, 
  BuddyConnection 
} from "../types/buddy.types";

interface BuddyState {
  preferences: BuddyPreference | null;
  matches: BuddyProfile[];
  buddyList: BuddyConnection[];
  pendingRequests: BuddyConnection[];
  sentRequests: BuddyConnection[];
  loading: {
    preferences: boolean;
    matches: boolean;
    buddyList: boolean;
    requests: boolean;
    actions: Record<string, boolean>; // key: buddyId/connectionId
  };
  error: string | null;
  totalMatches: number;
}

const initialState: BuddyState = {
  preferences: null,
  matches: [],
  buddyList: [],
  pendingRequests: [],
  sentRequests: [],
  loading: {
    preferences: false,
    matches: false,
    buddyList: false,
    requests: false,
    actions: {},
  },
  error: null,
  totalMatches: 0,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchPreferences = createAsyncThunk(
  "buddy/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      return await buddyService.getPreference();
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; 
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch preferences");
    }
  }
);

export const savePreferences = createAsyncThunk(
  "buddy/savePreferences",
  async (data: any, { rejectWithValue }) => {
    try {
      return await buddyService.savePreference(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save preferences");
    }
  }
);

export const fetchMatches = createAsyncThunk(
  "buddy/fetchMatches",
  async ({ page, limit, search, global }: { page: number; limit: number; search?: string; global?: boolean }, { rejectWithValue }) => {
    try {
      return await buddyService.findMatches(page, limit, search, global);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { profiles: [], total: 0 };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch matches");
    }
  }
);

export const fetchBuddyList = createAsyncThunk(
  "buddy/fetchBuddyList",
  async (_, { rejectWithValue }) => {
    try {
      return await buddyService.getBuddyList();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch buddy list");
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "buddy/fetchPendingRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await buddyService.getPendingRequests();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pending requests");
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  'buddy/fetchSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await buddyService.getSentRequests();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent requests');
    }
  }
);

export const sendBuddyRequest = createAsyncThunk(
  "buddy/sendBuddyRequest",
  async (buddyId: string, { rejectWithValue }) => {
    try {
      return await buddyService.sendRequest(buddyId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send request");
    }
  }
);

export const respondToBuddyRequest = createAsyncThunk(
  "buddy/respondToBuddyRequest",
  async ({ connectionId, status }: { connectionId: string; status: "CONNECTED" | "DECLINED" }, { rejectWithValue }) => {
    try {
      return await buddyService.respondToRequest(connectionId, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to respond to request");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const buddySlice = createSlice({
  name: "buddy",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Preferences
    builder.addCase(fetchPreferences.pending, (state) => {
      state.loading.preferences = true;
    });
    builder.addCase(fetchPreferences.fulfilled, (state, action) => {
      state.loading.preferences = false;
      state.preferences = action.payload;
    });
    builder.addCase(fetchPreferences.rejected, (state, action) => {
      state.loading.preferences = false;
      state.error = action.payload as string;
    });

    // Save Preferences
    builder.addCase(savePreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
    });

    // Fetch Matches
    builder.addCase(fetchMatches.pending, (state) => {
      state.loading.matches = true;
    });
    builder.addCase(fetchMatches.fulfilled, (state, action) => {
      state.loading.matches = false;
      state.matches = action.payload?.profiles || [];
      state.totalMatches = action.payload?.total || 0;
    });
    builder.addCase(fetchMatches.rejected, (state, action) => {
      state.loading.matches = false;
      state.error = action.payload as string;
    });

    // Fetch Buddy List
    builder.addCase(fetchBuddyList.pending, (state) => {
      state.loading.buddyList = true;
    });
    builder.addCase(fetchBuddyList.fulfilled, (state, action) => {
      state.loading.buddyList = false;
      state.buddyList = action.payload;
    });

    // Fetch Pending Requests
    builder      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading.requests = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchSentRequests.pending, (state) => {
        state.loading.requests = true;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.loading.requests = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.loading.requests = false;
        state.error = action.payload as string;
      })
;

    // Send Buddy Request
    builder.addCase(sendBuddyRequest.pending, (state, action) => {
      state.loading.actions[action.meta.arg] = true;
    });
    builder.addCase(sendBuddyRequest.fulfilled, (state, action) => {
      state.loading.actions[action.meta.arg] = false;
      // Optionally remove from matches or update status if buddy card supports it
    });
    builder.addCase(sendBuddyRequest.rejected, (state, action) => {
      state.loading.actions[action.meta.arg] = false;
      state.error = action.payload as string;
    });

    // Respond to Buddy Request
    builder.addCase(respondToBuddyRequest.pending, (state, action) => {
        state.loading.actions[action.meta.arg.connectionId] = true;
    });
    builder.addCase(respondToBuddyRequest.fulfilled, (state, action) => {
        state.loading.actions[action.meta.arg.connectionId] = false;
        // The list will be automatically refreshed by the thunk if we want, 
        // but it's better to just let the component handle it or trigger a refetch here.
        // For now, removing from pending is enough for the UI to feel responsive.
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.meta.arg.connectionId);
    });
  },
});

export const { clearError } = buddySlice.actions;
export default buddySlice.reducer;
