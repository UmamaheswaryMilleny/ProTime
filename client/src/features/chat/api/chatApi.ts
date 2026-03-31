import { ProTimeBackend } from "../../../api/instance";
import { API_ROUTES } from "../../../shared/constants/constants.routes";

export interface ConversationResponseDTO {
  id: string;
  buddyConnectionId: string;
  otherUser: { userId: string; fullName: string };
  lastMessageAt?: string;
  lastMessageBy?: string;
  lastMessageByName?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessageResponseDTO {
  id: string;
  conversationId: string;
  senderId: string | null;
  fullName: string | null;
  content: string;
  messageType: 'TEXT' | 'SYSTEM' | 'AI';
  status: 'SENT' | 'DELIVERED' | 'READ';
  readAt?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionResponseDTO {
  id: string;
  conversationId: string;
  startedBy: string;
  startedByName: string;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  pausedAt?: string;
  pomodorosCompleted: number;
  controlledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetChatMessagesResponseDTO {
  messages: DirectMessageResponseDTO[];
  hasMore: boolean;
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export const ReportStatus = {
  PENDING:   'PENDING',
  RESOLVED:  'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;

export type ReportContext = 'CHAT' | 'VIDEO_CALL';
export const ReportContext = {
  CHAT:       'CHAT',
  VIDEO_CALL: 'VIDEO_CALL',
} as const;

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'FAKE_PROFILE' | 'OTHER';
export const ReportReason = {
  SPAM:                  'SPAM',
  HARASSMENT:            'HARASSMENT',
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
  FAKE_PROFILE:          'FAKE_PROFILE',
  OTHER:                 'OTHER',
} as const;

export type ReportAction = 'WARNING' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK' | 'NO_ACTION';
export const ReportAction = {
  WARNING:         'WARNING',
  TEMPORARY_BLOCK: 'TEMPORARY_BLOCK',
  PERMANENT_BLOCK: 'PERMANENT_BLOCK',
  NO_ACTION:       'NO_ACTION',
} as const;

export interface SubmitReportRequestDTO {
  reportedUserId: string;
  context: ReportContext;
  reason: ReportReason;
  additionalDetails?: string;
}

export interface ResolveReportRequestDTO {
  action: ReportAction;
  adminNote?: string;
}

export const chatApi = {
  getConversations: async () => {
    const response = await ProTimeBackend.get<{ success: boolean; data: ConversationResponseDTO[] }>(API_ROUTES.CHAT_CONVERSATIONS);
    return response.data;
  },
  getMessages: async (conversationId: string, limit: number = 50, before?: string) => {
    const beforeParam = before ? `&before=${before}` : '';
    const response = await ProTimeBackend.get<{ success: boolean; data: GetChatMessagesResponseDTO }>(
      `${API_ROUTES.CHAT_MESSAGES(conversationId)}?limit=${limit}${beforeParam}`
    );
    return response.data;
  },
  sendMessage: async (conversationId: string, content: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: DirectMessageResponseDTO }>(
      API_ROUTES.CHAT_MESSAGES(conversationId),
      { content }
    );
    return response.data;
  },
  markAsRead: async (conversationId: string) => {
    const response = await ProTimeBackend.patch<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_READ(conversationId)
    );
    return response.data;
  },
  startSession: async (conversationId: string, durationMinutes: number) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_SESSION_START(conversationId),
      { durationMinutes }
    );
    return response.data;
  },
  endSession: async (conversationId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_SESSION_END(conversationId)
    );
    return response.data;
  },
  startBuddySession: async (conversationId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_BUDDY_SESSION_START(conversationId)
    );
    return response.data;
  },
  endBuddySession: async (conversationId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_BUDDY_SESSION_END(conversationId)
    );
    return response.data;
  },
  deleteChat: async (conversationId: string) => {
    const response = await ProTimeBackend.delete<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_DELETE(conversationId)
    );
    return response.data;
  },
  proposeBuddySession: async (conversationId: string, payload: { date: string; startTime: string; endTime: string }) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_BUDDY_SESSION_PROPOSE(conversationId),
      payload
    );
    return response.data;
  },
  discussWithProBuddy: async (conversationId: string, prompt: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: { reply: string } }>(
      API_ROUTES.CHAT_PROBUDDY(conversationId),
      { prompt }
    );
    return response.data;
  },
  initProBuddyChat: async () => {
    const response = await ProTimeBackend.get<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_PROBUDDY_INIT
    );
    return response.data;
  },
  proposeRecurringSession: async (conversationId: string, payload: { days: string[]; startTime: string; endTime: string; noOfSessions: number; dates?: string[] }) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any }>(
      API_ROUTES.CHAT_BUDDY_SESSION_PROPOSE_RECURRING(conversationId),
      payload
    );
    return response.data;
  },
  submitReport: async (payload: SubmitReportRequestDTO) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: any; message?: string }>(
      API_ROUTES.REPORT_SUBMIT,
      payload
    );
    return response.data;
  },
  // Admin methods
  getReports: async (params?: { status?: ReportStatus; page?: number; limit?: number }) => {
    const response = await ProTimeBackend.get<{ success: boolean; data: { reports: any[]; total: number } }>(
      API_ROUTES.ADMIN_REPORTS,
      { params }
    );
    return response.data;
  },
  resolveReport: async (reportId: string, payload: ResolveReportRequestDTO) => {
    const response = await ProTimeBackend.patch<{ success: boolean; data: any; message?: string }>(
      API_ROUTES.ADMIN_RESOLVE_REPORT(reportId),
      payload
    );
    return response.data;
  },
};
