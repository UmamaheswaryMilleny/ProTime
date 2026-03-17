import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';

export interface CommunityMessage {
    id: string;
    userId: string;
    content: string;
    fullName: string;
    senderAvatar?: string;
    createdAt: string;
}

interface CommunityState {
    messages: CommunityMessage[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    sending: boolean;
    monthlyCount: number;
    lastFetchedBefore: string | null;
}

const initialState: CommunityState = {
    messages: [],
    isLoading: false,
    error: null,
    hasMore: true,
    sending: false,
    monthlyCount: 0,
    lastFetchedBefore: null,
};

export const fetchMessages = createAsyncThunk(
    'community/fetchMessages',
    async (before: string | null, { rejectWithValue }) => {
        try {
            const params = before ? { before } : {};
            const response = await ProTimeBackend.get(API_ROUTES.COMMUNITY_CHAT, { params });
            return response.data.data; // { messages: [], hasMore: boolean }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch messages';
            return rejectWithValue(message);
        }
    }
);

export const sendMessage = createAsyncThunk(
    'community/sendMessage',
    async (content: string, { rejectWithValue }) => {
        try {
            const response = await ProTimeBackend.post(API_ROUTES.COMMUNITY_CHAT, { content });
            return response.data.data; // The saved message
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send message';
            return rejectWithValue(message);
        }
    }
);

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<CommunityMessage>) => {
            // Avoid duplicates if we just sent it or received via socket
            if (!state.messages.find(m => m.id === action.payload.id)) {
                state.messages.push(action.payload);
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                const newMessages = action.payload.messages;
                
                // Filter out messages already in state to avoid duplicate keys
                const filteredMessages = newMessages.filter(
                    (newMsg: CommunityMessage) => !state.messages.some(m => m.id === newMsg.id)
                );

                // Prepend older messages (newest of the old batch first)
                state.messages = [...filteredMessages.reverse(), ...state.messages];
                state.hasMore = action.payload.hasMore;
                if (action.payload.monthlyCount !== undefined) {
                    state.monthlyCount = action.payload.monthlyCount;
                }
                if (newMessages.length > 0) {
                    state.lastFetchedBefore = newMessages[0].createdAt;
                }
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(sendMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sending = false;
                state.monthlyCount += 1;
                // Message will be added via socket or this fulfilled case
                if (!state.messages.find(m => m.id === action.payload.id)) {
                    state.messages.push(action.payload);
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sending = false;
                state.error = action.payload as string;
            });
    },
});

export const { addMessage, clearError } = communitySlice.actions;
export default communitySlice.reducer;
