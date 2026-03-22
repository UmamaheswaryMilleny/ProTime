import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { gamificationService } from '../services/gamification.service';
import type { GamificationData, UserBadge } from '../types/gamification.types';

interface GamificationState {
    data: GamificationData | null;
    isLoading: boolean;
    error: string | null;
    pendingBadgeNotifications: UserBadge[];
}

const initialState: GamificationState = {
    data: null,
    isLoading: false,
    error: null,
    pendingBadgeNotifications: [],
};

export const fetchGamificationData = createAsyncThunk(
    'gamification/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            return await gamificationService.getGamificationData();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch gamification data');
        }
    }
);

const gamificationSlice = createSlice({
    name: 'gamification',
    initialState,
    reducers: {
        addBadgeNotification: (state, action: PayloadAction<UserBadge>) => {
            state.pendingBadgeNotifications.push(action.payload);
            // Also update the earnedBadges list if it exists so dashboard reflects it immediately
            if (state.data) {
                const alreadyEarned = state.data.earnedBadges.some(b => b.badgeKey === action.payload.badgeKey);
                if (!alreadyEarned) {
                    state.data.earnedBadges.push(action.payload);
                    state.data.totalBadgeCount += 1;
                }
            }
        },
        clearBadgeNotification: (state, action: PayloadAction<string>) => {
            state.pendingBadgeNotifications = state.pendingBadgeNotifications.filter(
                (badge) => badge.id !== action.payload
            );
        },
        updateGamificationLocal: (state, action: PayloadAction<Partial<GamificationData>>) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGamificationData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGamificationData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchGamificationData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { addBadgeNotification, clearBadgeNotification, updateGamificationLocal } = gamificationSlice.actions;
export default gamificationSlice.reducer;
