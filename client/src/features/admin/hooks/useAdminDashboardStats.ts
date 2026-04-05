import { useQuery } from '@tanstack/react-query';
import { ProTimeBackend } from '../../../api/instance';

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  monthlyRevenue: number;
  pendingReports: number;
  activeRooms: number;
  userGrowth: { date: string; count: number }[];
  revenueTrend: { month: string; revenue: number }[];
  recentReports: any[];
  recentSignups: any[];
}

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await ProTimeBackend.get('/admin/dashboard/stats');
      return response.data.data;
    },
  });
};
