import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { studyRoomApi, type StudyRoomDTO, type RoomMessageDTO, type RoomJoinRequestDTO, type GetRoomsParams, type CreateRoomPayload } from '../api/studyRoomApi';

// ─── State ───────────────────────────────────────────────────────────────────

interface StudyRoomState {
  rooms: StudyRoomDTO[];
  myRooms: StudyRoomDTO[];
  activeRoom: StudyRoomDTO | null;
  messages: RoomMessageDTO[];
  pendingRequests: RoomJoinRequestDTO[];
  invitations: RoomJoinRequestDTO[];
  allRequests: RoomJoinRequestDTO[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  total: number;
  // Group Video Call state (similar to chat's activeCall)
  isInGroupCall: boolean;
  groupCallRoomId: string | null;
}

const initialState: StudyRoomState = {
  rooms: [],
  myRooms: [],
  activeRoom: null,
  messages: [],
  pendingRequests: [],
  invitations: [],
  allRequests: [],
  isLoading: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  total: 0,
  isInGroupCall: false,
  groupCallRoomId: null,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchRooms = createAsyncThunk(
  'studyRoom/fetchRooms',
  async (params: GetRoomsParams | undefined, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getRooms(params);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchMyRooms = createAsyncThunk(
  'studyRoom/fetchMyRooms',
  async (_, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getMyRooms();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch my rooms');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'studyRoom/fetchRoomById',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getRoomById(roomId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Room not found');
    }
  }
);

export const createRoom = createAsyncThunk(
  'studyRoom/createRoom',
  async (payload: CreateRoomPayload, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.createRoom(payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to create room');
    }
  }
);

export const joinRoom = createAsyncThunk(
  'studyRoom/joinRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.joinRoom(roomId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to join room');
    }
  }
);

export const requestToJoin = createAsyncThunk(
  'studyRoom/requestToJoin',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.requestToJoin(roomId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to send request');
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'studyRoom/fetchPendingRequests',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getPendingRequests(roomId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const respondToJoinRequest = createAsyncThunk(
  'studyRoom/respondToJoinRequest',
  async ({ requestId, action }: { requestId: string; action: 'ACCEPTED' | 'REJECTED' }, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.respondToRequest(requestId, action);
      return { data: res.data, requestId };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to respond to request');
    }
  }
);

export const leaveRoom = createAsyncThunk(
  'studyRoom/leaveRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      await studyRoomApi.leaveRoom(roomId);
      return roomId;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to leave room');
    }
  }
);

export const kickUser = createAsyncThunk(
  'studyRoom/kickUser',
  async ({ roomId, userId }: { roomId: string; userId: string }, { rejectWithValue }) => {
    try {
      await studyRoomApi.kickUser(roomId, userId);
      return { roomId, userId };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to kick user');
    }
  }
);

export const inviteToRoom = createAsyncThunk(
  'studyRoom/inviteToRoom',
  async ({ roomId, userId }: { roomId: string; userId: string }, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.inviteToRoom(roomId, userId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to invite buddy');
    }
  }
);

export const endRoom = createAsyncThunk(
  'studyRoom/endRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      await studyRoomApi.endRoom(roomId);
      return roomId;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to end room');
    }
  }
);

export const startRoom = createAsyncThunk(
  'studyRoom/startRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.startRoom(roomId);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to start room');
    }
  }
);

export const fetchRoomMessages = createAsyncThunk(
  'studyRoom/fetchMessages',
  async ({ roomId, page }: { roomId: string; page?: number }, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getMessages(roomId, page || 1);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendRoomMessage = createAsyncThunk(
  'studyRoom/sendMessage',
  async ({ roomId, content, file }: { roomId: string; content?: string; file?: File }, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.sendMessage(roomId, { content, file });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchAllRequests = createAsyncThunk(
  'studyRoom/fetchAllRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await studyRoomApi.getAllRequests();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch all requests');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const studyRoomSlice = createSlice({
  name: 'studyRoom',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<StudyRoomDTO | null>) => {
      state.activeRoom = action.payload;
      if (!action.payload) {
        state.messages = [];
        state.pendingRequests = [];
      }
    },
    addIncomingMessage: (state, action: PayloadAction<RoomMessageDTO>) => {
      if (!state.messages.find(m => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    },
    clearRoomMessages: (state) => {
      state.messages = [];
    },
    startGroupCall: (state, action: PayloadAction<string>) => {
      state.isInGroupCall = true;
      state.groupCallRoomId = action.payload;
    },
    endGroupCall: (state) => {
      state.isInGroupCall = false;
      state.groupCallRoomId = null;
    },
    removePendingRequest: (state, action: PayloadAction<string>) => {
      state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchRooms
    builder.addCase(fetchRooms.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(fetchRooms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.rooms = action.payload.rooms;
      state.total = action.payload.total;
    });
    builder.addCase(fetchRooms.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchMyRooms
    builder.addCase(fetchMyRooms.fulfilled, (state, action) => {
      state.myRooms = action.payload;
    });

    // fetchRoomById
    builder.addCase(fetchRoomById.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchRoomById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeRoom = action.payload;
    });
    builder.addCase(fetchRoomById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // createRoom
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.myRooms.unshift(action.payload);
      state.rooms.unshift(action.payload);
    });

    // joinRoom — immediately update the room card in both lists so the
    // button flips from "Join Now" → "Enter Room" without a page refresh.
    builder.addCase(joinRoom.fulfilled, (state, action) => {
      state.activeRoom = action.payload;
      // Patch participantIds in the explore list
      const rIdx = state.rooms.findIndex(r => r.id === action.payload.id);
      if (rIdx !== -1) {
        state.rooms[rIdx] = {
          ...state.rooms[rIdx],
          participantIds: action.payload.participantIds,
          status: action.payload.status,
        };
      }
      // Patch in myRooms as well (may not be there yet — add it if missing)
      const mIdx = state.myRooms.findIndex(r => r.id === action.payload.id);
      if (mIdx !== -1) {
        state.myRooms[mIdx] = {
          ...state.myRooms[mIdx],
          participantIds: action.payload.participantIds,
          status: action.payload.status,
        };
      } else {
        // Room wasn't in myRooms yet — prepend it so it appears under My Rooms tab
        state.myRooms.unshift(action.payload);
      }
    });

    // fetchPendingRequests
    builder.addCase(fetchPendingRequests.fulfilled, (state, action) => {
      state.pendingRequests = action.payload;
    });

    // respondToJoinRequest
    builder.addCase(respondToJoinRequest.fulfilled, (state, action) => {
      state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload.requestId);
    });

    // leaveRoom / endRoom
    builder.addCase(leaveRoom.fulfilled, (state) => {
      state.activeRoom = null;
      state.messages = [];
    });
    // For kickUser, state refresh may be handled by sockets, but we can also handle it locally if needed.
    // Host kicks someone, wait for socket event to refresh list, or do it immediately:
    builder.addCase(kickUser.fulfilled, (state, action) => {
      if (state.activeRoom) {
        state.activeRoom.participants = state.activeRoom.participants?.filter(p => p.id !== action.payload.userId);
        state.activeRoom.participantIds = state.activeRoom.participantIds.filter(id => id !== action.payload.userId);
      }
    });
    builder.addCase(endRoom.fulfilled, (state) => {
      state.activeRoom = null;
      state.messages = [];
    });
    
    // startRoom
    builder.addCase(startRoom.pending, (state) => { state.isLoading = true; });
    builder.addCase(startRoom.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeRoom = action.payload;
      // Update in rooms list if present
      const idx = state.rooms.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state.rooms[idx] = action.payload;
      // Update in myRooms list if present
      const mIdx = state.myRooms.findIndex(r => r.id === action.payload.id);
      if (mIdx !== -1) state.myRooms[mIdx] = action.payload;
    });
    builder.addCase(startRoom.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchRoomMessages
    builder.addCase(fetchRoomMessages.pending, (state) => { state.isLoadingMessages = true; });
    builder.addCase(fetchRoomMessages.fulfilled, (state, action) => {
      state.isLoadingMessages = false;
      state.messages = action.payload.messages;
    });
    builder.addCase(fetchRoomMessages.rejected, (state) => { state.isLoadingMessages = false; });

    // sendRoomMessage
    builder.addCase(sendRoomMessage.pending, (state) => { state.isSending = true; });
    builder.addCase(sendRoomMessage.fulfilled, (state, action) => {
      state.isSending = false;
      if (!state.messages.find(m => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    });
    builder.addCase(sendRoomMessage.rejected, (state) => { state.isSending = false; });

    // fetchAllRequests
    builder.addCase(fetchAllRequests.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchAllRequests.fulfilled, (state, action) => {
      state.isLoading = false;
      state.invitations = action.payload.invitations;
      state.allRequests = action.payload.joinRequests;
    });
    builder.addCase(fetchAllRequests.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setActiveRoom,
  addIncomingMessage,
  clearRoomMessages,
  startGroupCall,
  endGroupCall,
  removePendingRequest,
  clearError,
} = studyRoomSlice.actions;

export default studyRoomSlice.reducer;
