import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchGamificationData } from '../store/gamificationSlice';

export const useGamification = () => {
    const dispatch = useAppDispatch();
    const { data: gamification, isLoading, error } = useAppSelector(state => state.gamification);

    const refreshGamification = useCallback(() => {
        dispatch(fetchGamificationData());
    }, [dispatch]);

    useEffect(() => {
        if (!gamification && !isLoading) {
            dispatch(fetchGamificationData());
        }
    }, [dispatch, gamification, isLoading]);

    return {
        gamification,
        isLoading,
        error,
        refreshGamification
    };
};
