import { ProTimeBackend as api } from '../../../api/instance';
import type { GamificationData } from '../types/gamification.types';

export const gamificationService = {
    getGamificationData: async (): Promise<GamificationData> => {
        const response = await api.get('/gamification');
        return response.data.data;
    }
};
