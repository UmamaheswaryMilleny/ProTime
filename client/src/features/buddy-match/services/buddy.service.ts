import { ProTimeBackend } from "../../../api/instance";
import { API_ROUTES } from "../../../shared/constants/constants.routes";
import type { 
  BuddyPreference, 
  SaveBuddyPreferenceRequest, 
  BuddyProfile, 
  BuddyConnection 
} from "../types/buddy.types";

export const buddyService = {
  getPreference: async () => {
    const response = await ProTimeBackend.get<{ data: BuddyPreference }>(
      API_ROUTES.BUDDY_PREFERENCE
    );
    return response.data.data;
  },

  savePreference: async (preference: SaveBuddyPreferenceRequest) => {
    const response = await ProTimeBackend.put<{ data: BuddyPreference }>(
      API_ROUTES.BUDDY_PREFERENCE,
      preference
    );
    return response.data.data;
  },

  findMatches: async (page: number = 1, limit: number = 10, search?: string, global: boolean = false) => {
    const response = await ProTimeBackend.get<{ data: { profiles: BuddyProfile[], total: number } }>(
      API_ROUTES.BUDDY_MATCHES,
      { params: { page, limit, search, global: global ? 'true' : 'false' } }
    );
    return response.data.data;
  },

  getBuddyList: async () => {
    const response = await ProTimeBackend.get<{ data: BuddyConnection[] }>(
      API_ROUTES.BUDDY_LIST
    );
    return response.data.data;
  },

  getPendingRequests: async () => {
    const response = await ProTimeBackend.get<{ data: BuddyConnection[] }>(
      API_ROUTES.BUDDY_PENDING_REQUESTS
    );
    return response.data.data;
  },

  getSentRequests: async () => {
    const response = await ProTimeBackend.get<{ data: BuddyConnection[] }>(
      API_ROUTES.BUDDY_SENT_REQUESTS
    );
    return response.data.data;
  },

  sendRequest: async (buddyId: string) => {
    const response = await ProTimeBackend.post<{ message: string }>(
      API_ROUTES.BUDDY_SEND_REQUEST(buddyId)
    );
    return response.data;
  },

  respondToRequest: async (connectionId: string, status: 'CONNECTED' | 'DECLINED') => {
    const action = status === 'CONNECTED' ? 'ACCEPT' : 'DECLINE';
    const response = await ProTimeBackend.patch<{ message: string }>(
      API_ROUTES.BUDDY_RESPOND_REQUEST(connectionId),
      { action }
    );
    return response.data;
  },

  blockUser: async (targetUserId: string) => {
    const response = await ProTimeBackend.post<{ message: string }>(
      `/buddy/block/${targetUserId}`
    );
    return response.data;
  },

  unblockUser: async (connectionId: string) => {
    const response = await ProTimeBackend.post<{ message: string }>(
      `/buddy/unblock/${connectionId}`
    );
    return response.data;
  },

  getBlockedUsers: async () => {
    const response = await ProTimeBackend.get<{ data: BuddyConnection[] }>(
      `/buddy/blocked`
    );
    return response.data.data;
  },
};
