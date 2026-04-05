import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';

export const gamificationKeys = {
  all: ['admin-gamification'] as const,
  overview: () => [...gamificationKeys.all, 'overview'] as const,
  users: (filters: any) => [...gamificationKeys.all, 'users', filters] as const,
  userDetail: (userId: string) => [...gamificationKeys.all, 'users', userId] as const,
  leaderboard: (filters: any) => [...gamificationKeys.all, 'leaderboard', filters] as const,
  badges: () => [...gamificationKeys.all, 'badges'] as const,
};

export const useGamificationOverview = () => {
  return useQuery({
    queryKey: gamificationKeys.overview(),
    queryFn: async () => {
      const res = await ProTimeBackend.get(API_ROUTES.ADMIN_GAMIFICATION_OVERVIEW);
      return res.data.data;
    },
  });
};

export const useGamificationUsers = (filters: { page: number; limit: number; search?: string; level?: string; title?: string; sortBy?: string }) => {
  return useQuery({
    queryKey: gamificationKeys.users(filters),
    queryFn: async () => {
      const { data } = await ProTimeBackend.get(API_ROUTES.ADMIN_GAMIFICATION_USERS, { params: filters });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
};

export const useGamificationUserDetail = (userId: string | null) => {
  return useQuery({
    queryKey: gamificationKeys.userDetail(userId!),
    queryFn: async () => {
      const { data } = await ProTimeBackend.get(API_ROUTES.ADMIN_GAMIFICATION_USER_DETAIL(userId!));
      return data.data;
    },
    enabled: !!userId,
  });
};

export const useGamificationLeaderboard = (filters: { page: number; limit: number; period?: string; plan?: string }) => {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(filters),
    queryFn: async () => {
      const { data } = await ProTimeBackend.get(API_ROUTES.ADMIN_GAMIFICATION_LEADERBOARD, { params: filters });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
};

export const useGamificationBadges = () => {
  return useQuery({
    queryKey: gamificationKeys.badges(),
    queryFn: async () => {
      const { data } = await ProTimeBackend.get(API_ROUTES.ADMIN_GAMIFICATION_BADGES);
      return data.data;
    },
  });
};

export const useToggleBadgeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (badgeId: string) => {
      const { data } = await ProTimeBackend.patch(API_ROUTES.ADMIN_GAMIFICATION_BADGE_TOGGLE(badgeId));
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.badges() });
    },
  });
};
