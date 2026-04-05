import { UserEntity } from '../../../../domain/entities/user.entity';
import { ReportEntity } from '../../../../domain/entities/report.entity';

export interface IGetAdminDashboardStatsUsecase {
  execute(): Promise<{
    totalUsers: number;
    premiumUsers: number;
    monthlyRevenue: number;
    pendingReports: number;
    activeRooms: number;
    userGrowth: { date: string; count: number }[];
    revenueTrend: { month: string; revenue: number }[];
    recentReports: ReportEntity[];
    recentSignups: UserEntity[];
  }>;
}
