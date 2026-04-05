import { inject, injectable } from 'tsyringe';
import type { IGetAdminDashboardStatsUsecase } from '../../interface/admin/get-admin-dashboard-stats.usecase.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IReportRepository } from '../../../../domain/repositories/report/report.repository.interface';
import type { IStudyRoomRepository } from '../../../../domain/repositories/study-room/study-room.repository.interface';
import { UserRole } from '../../../../domain/enums/user.enums';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';
import { RoomStatus } from '../../../../domain/enums/study-room.enums';
import { ReportStatus } from '../../../../domain/enums/report.enums';

@injectable()
export class GetAdminDashboardStatsUsecase implements IGetAdminDashboardStatsUsecase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('ISubscriptionRepository') private readonly subscriptionRepository: ISubscriptionRepository,
    @inject('IReportRepository') private readonly reportRepository: IReportRepository,
    @inject('IStudyRoomRepository') private readonly roomRepository: IStudyRoomRepository,
  ) {}

  async execute() {
    const [
      totalUsers,
      premiumUsers,
      pendingReports,
      activeRooms,
      userGrowth,
      revenueTrend,
      recentReportsResult,
      recentSignups
    ] = await Promise.all([
      this.userRepository.countDocuments({ role: UserRole.CLIENT, isDeleted: { $ne: true } }),
      this.subscriptionRepository.countDocuments({ plan: SubscriptionPlan.PREMIUM, status: SubscriptionStatus.ACTIVE }),
      this.reportRepository.findAll({ status: ReportStatus.PENDING, page: 1, limit: 1 }).then(r => r.total),
      this.roomRepository.findAll({ status: RoomStatus.LIVE, page: 1, limit: 1 }).then(r => r.total),
      this.userRepository.getUserGrowth(30),
      this.subscriptionRepository.getRevenueTrend(6),
      this.reportRepository.findAll({ status: ReportStatus.PENDING, page: 1, limit: 5 }),
      this.userRepository.getRecentSignups(5),
    ]);

    const monthlyRevenue = premiumUsers * 499;

    return {
      totalUsers,
      premiumUsers,
      monthlyRevenue,
      pendingReports,
      activeRooms,
      userGrowth,
      revenueTrend,
      recentReports: recentReportsResult.reports,
      recentSignups,
    };
  }
}
