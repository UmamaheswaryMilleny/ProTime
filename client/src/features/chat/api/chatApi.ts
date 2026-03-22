import { ProTimeBackend } from "../../../api/instance";
import { API_ROUTES } from "../../../shared/constants/constants.routes";

export interface ConversationResponseDTO {
  id:                string;
  buddyConnectionId: string;
  otherUser:         { userId: string; fullName: string };
  lastMessageAt?:    string;
  lastMessageBy?:    string;
  unreadCount:       number;
  createdAt:         string;
  updatedAt:         string;
}

export interface DirectMessageResponseDTO {
  id:             string;
  conversationId: string;
  senderId:       string | null;
  fullName:       string | null;
  content:        string;
  messageType:    'TEXT' | 'SYSTEM';
  status:         'SENT' | 'DELIVERED' | 'READ';
  readAt?:        string;
  sessionId?:     string;
  createdAt:      string;
  updatedAt:      string;
}

export interface ChatSessionResponseDTO {
  id:                 string;
  conversationId:     string;
  startedBy:          string;
  startedByName:      string;
  durationMinutes:    number;
  startedAt:          string;
  endedAt?:           string;
  pausedAt?:          string;
  pomodorosCompleted: number;
  controlledBy?:      string;
  createdAt:          string;
  updatedAt:          string;
}

export interface GetChatMessagesResponseDTO {
  messages: DirectMessageResponseDTO[];
  hasMore:  boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data:    T;
}

export const chatApi = {
  getConversations: async (): Promise<ApiResponse<ConversationResponseDTO[]>> => {
    const response = await ProTimeBackend.get<ApiResponse<ConversationResponseDTO[]>>(
      API_ROUTES.CHAT_CONVERSATIONS,
    );
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    limit:          number = 50,
    before?:        string,
  ): Promise<ApiResponse<GetChatMessagesResponseDTO>> => {
    const beforeParam = before ? `&before=${before}` : '';
    const response = await ProTimeBackend.get<ApiResponse<GetChatMessagesResponseDTO>>(
      `${API_ROUTES.CHAT_MESSAGES(conversationId)}?limit=${limit}${beforeParam}`,
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    content:        string,
  ): Promise<ApiResponse<DirectMessageResponseDTO>> => {
    const response = await ProTimeBackend.post<ApiResponse<DirectMessageResponseDTO>>(
      API_ROUTES.CHAT_MESSAGES(conversationId),
      { content },
    );
    return response.data;
  },

  markAsRead: async (
    conversationId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await ProTimeBackend.patch<ApiResponse<null>>(
      API_ROUTES.CHAT_READ(conversationId),
    );
    return response.data;
  },

  startSession: async (
    conversationId:  string,
    durationMinutes: number,
  ): Promise<ApiResponse<ChatSessionResponseDTO>> => {
    const response = await ProTimeBackend.post<ApiResponse<ChatSessionResponseDTO>>(
      API_ROUTES.CHAT_SESSION_START(conversationId),
      { durationMinutes },
    );
    return response.data;
  },

  endSession: async (
    conversationId: string,
  ): Promise<ApiResponse<ChatSessionResponseDTO>> => {
    const response = await ProTimeBackend.post<ApiResponse<ChatSessionResponseDTO>>(
      API_ROUTES.CHAT_SESSION_END(conversationId),
    );
    return response.data;
  },
};