import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ConversationResponseDTO, ChatSessionResponseDTO } from '../api/chatApi';

interface ChatState {
  conversations: ConversationResponseDTO[];
  onlineUsers: Record<string, boolean>; // userId -> true/false
  activeSessions: Record<string, ChatSessionResponseDTO>; // conversationId -> session
  incomingCall: { conversationId: string; offer: RTCSessionDescriptionInit; callerName: string } | null;
  activeCall: { conversationId: string; isCaller: boolean; offer?: RTCSessionDescriptionInit; isReconnecting?: boolean } | null;
  
  // ProBuddy State
  isAILoading: boolean;
}

const getInitialActiveCall = () => {
  try {
    const stored = sessionStorage.getItem('activeVideoCall');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse activeVideoCall from sessionStorage', e);
  }
  return null;
};

const initialState: ChatState = {
  conversations: [],
  onlineUsers: {},
  activeSessions: {},
  incomingCall: null,
  activeCall: getInitialActiveCall(),
  isAILoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<ConversationResponseDTO[]>) => {
      state.conversations = action.payload;
    },
    updateConversationPreview: (state, action: PayloadAction<{ conversationId: string; lastMessageBy: string | null; lastMessageByName?: string; lastMessageAt: string; incrementUnread?: boolean }>) => {
      const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessageBy = action.payload.lastMessageBy || '';
        state.conversations[convIndex].lastMessageByName = action.payload.lastMessageByName;
        state.conversations[convIndex].lastMessageAt = action.payload.lastMessageAt;
        if (action.payload.incrementUnread) {
          state.conversations[convIndex].unreadCount += 1;
        }
        // Move to top
        const updatedConv = state.conversations.splice(convIndex, 1)[0];
        state.conversations.unshift(updatedConv);
      }
    },
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find(c => c.id === action.payload);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    setUserOnlineStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.isOnline;
    },
    setActiveSession: (state, action: PayloadAction<ChatSessionResponseDTO>) => {
      state.activeSessions[action.payload.conversationId] = action.payload;
    },
    removeActiveSession: (state, action: PayloadAction<string>) => {
      delete state.activeSessions[action.payload];
    },
    setIncomingCall: (state, action: PayloadAction<{ conversationId: string; offer: RTCSessionDescriptionInit; callerName: string } | null>) => {
      state.incomingCall = action.payload;
    },
    setActiveCall: (state, action: PayloadAction<{ conversationId: string; isCaller: boolean; offer?: RTCSessionDescriptionInit; isReconnecting?: boolean } | null>) => {
      state.activeCall = action.payload;
      if (action.payload) {
         sessionStorage.setItem('activeVideoCall', JSON.stringify({ ...action.payload, isReconnecting: true }));
      } else {
         sessionStorage.removeItem('activeVideoCall');
      }
    },
    
    setAILoading: (state, action: PayloadAction<boolean>) => {
      state.isAILoading = action.payload;
    }
  },
});

export const { 
  setConversations, 
  updateConversationPreview, 
  clearUnreadCount, 
  setUserOnlineStatus,
  setActiveSession,
  removeActiveSession,
  setIncomingCall,
  setActiveCall,
  setAILoading
} = chatSlice.actions;
export default chatSlice.reducer;
