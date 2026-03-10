import { useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/gamification.service';
import type { GamificationData } from '../types/gamification.types';

export const useGamification = () => {
    const [gamification, setGamification] = useState<GamificationData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGamificationData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await gamificationService.getGamificationData();
            setGamification(data);
        } catch (err) {
            setError('Failed to fetch gamification data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGamificationData();
    }, [fetchGamificationData]);

    return {
        gamification,
        isLoading,
        error,
        refreshGamification: fetchGamificationData
    };
};
