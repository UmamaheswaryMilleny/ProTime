import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export type RoomType = 'PUBLIC' | 'PRIVATE';
export type RoomStatus = 'LIVE' | 'ENDED' | 'WAITING';
export type RoomFeature = 'POMODORO' | 'VIDEO' | 'CHAT';
export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INVITED';

export interface StudyRoomDTO {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  type: RoomType;
  status: RoomStatus;
  maxParticipants: number;
  features: RoomFeature[];
  levelRequired?: string;
  startTime?: string;
  endTime?: string;
  participantIds: string[];
  tags?: string[];
  participants?: { id: string; name: string; avatar?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomJoinRequestDTO {
  id: string;
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  status: JoinRequestStatus;
  isAlreadyParticipant: boolean;
  createdAt: string;
}

export interface RoomMessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  type: RoomType;
  maxParticipants: number;
  tags?: string[];
  features?: RoomFeature[];
  levelRequired?: string;
  startTime?: string;
  endTime?: string;
  invitedUserIds?: string[];
}

export interface GetRoomsParams {
  type?: RoomType;
  status?: RoomStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const studyRoomApi = {
  getRooms: async (params?: GetRoomsParams) => {
    const response = await ProTimeBackend.get<{ success: boolean; data: { rooms: StudyRoomDTO[]; total: number; page: number; limit: number } }>(
      API_ROUTES.ROOMS,
      { params }
    );
    return response.data;
  },

  getMyRooms: async () => {
    const response = await ProTimeBackend.get<{ success: boolean; data: StudyRoomDTO[] }>(
      API_ROUTES.ROOMS_MY
    );
    return response.data;
  },

  getAllRequests: async () => {
    const response = await ProTimeBackend.get<{ success: boolean; data: { invitations: RoomJoinRequestDTO[]; joinRequests: RoomJoinRequestDTO[] } }>(
      API_ROUTES.ROOMS_ALL_REQUESTS
    );
    return response.data;
  },

  getRoomById: async (roomId: string) => {
    const response = await ProTimeBackend.get<{ success: boolean; data: StudyRoomDTO }>(
      API_ROUTES.ROOMS_BY_ID(roomId)
    );
    return response.data;
  },

  createRoom: async (payload: CreateRoomPayload) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: StudyRoomDTO }>(
      API_ROUTES.ROOMS,
      payload
    );
    return response.data;
  },

  joinRoom: async (roomId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: StudyRoomDTO }>(
      API_ROUTES.ROOMS_JOIN(roomId)
    );
    return response.data;
  },

  requestToJoin: async (roomId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: RoomJoinRequestDTO }>(
      API_ROUTES.ROOMS_REQUEST(roomId)
    );
    return response.data;
  },

  getPendingRequests: async (roomId: string) => {
    const response = await ProTimeBackend.get<{ success: boolean; data: RoomJoinRequestDTO[] }>(
      API_ROUTES.ROOMS_PENDING_REQUESTS(roomId)
    );
    return response.data;
  },

  respondToRequest: async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    const response = await ProTimeBackend.post<{ success: boolean; data: RoomJoinRequestDTO }>(
      API_ROUTES.ROOMS_RESPOND_REQUEST(requestId),
      { action }
    );
    return response.data;
  },

  leaveRoom: async (roomId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; message: string }>(
      API_ROUTES.ROOMS_LEAVE(roomId)
    );
    return response.data;
  },

  endRoom: async (roomId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; message: string }>(
      API_ROUTES.ROOMS_END(roomId)
    );
    return response.data;
  },

  startRoom: async (roomId: string) => {
    const response = await ProTimeBackend.post<{ success: boolean; data: StudyRoomDTO }>(
      API_ROUTES.ROOMS_START(roomId)
    );
    return response.data;
  },

  getMessages: async (roomId: string, page = 1, limit = 50) => {
    const response = await ProTimeBackend.get<{ success: boolean; data: { messages: RoomMessageDTO[]; total: number } }>(
      `${API_ROUTES.ROOMS_MESSAGES(roomId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  sendMessage: async (roomId: string, payload: { content?: string; file?: File } | FormData) => {
    let finalData = payload;
    let headers = {};

    if (!(payload instanceof FormData) && payload.file) {
      finalData = new FormData();
      if (payload.content) (finalData as FormData).append('content', payload.content);
      if (payload.file) (finalData as FormData).append('file', payload.file);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await ProTimeBackend.post<{ success: boolean; data: RoomMessageDTO }>(
      API_ROUTES.ROOMS_MESSAGES(roomId),
      finalData,
      { headers }
    );
    return response.data;
  },
};
