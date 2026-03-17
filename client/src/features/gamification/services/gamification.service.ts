import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import type { GamificationData } from '../types/gamification.types';

export const gamificationService = {
    getGamificationData: async (): Promise<GamificationData> => {
        const response = await api.get(API_ROUTES.GAMIFICATION);
        return response.data.data;
    }
};
