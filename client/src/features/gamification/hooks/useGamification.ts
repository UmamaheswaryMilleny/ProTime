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
        if (!gamification && !isLoading && !error) {
            dispatch(fetchGamificationData());
        }
    }, [dispatch, gamification, isLoading, error]);

    return {
        gamification,
        isLoading,
        error,
        refreshGamification
    };
};
