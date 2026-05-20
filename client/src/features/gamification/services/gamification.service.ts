import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import type { GamificationData } from '../types/gamification.types';

export const gamificationService = {
  getGamificationData: async (): Promise<GamificationData> => {
        const response = await api.get(API_ROUTES.GAMIFICATION);
        return response.data.data;
  },
  getLeaderboard: async (range: string, type: string) => {
        const response = await api.get(`${API_ROUTES.GAMIFICATION}/leaderboard`, { params: { range, type } });
        return response.data; // Response data should contain .data.leaderboard, .data.userRank, .data.userEntry
  }
};
