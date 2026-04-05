import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IGetAdminDashboardStatsUsecase } from '../../../application/usecase/interface/admin/get-admin-dashboard-stats.usecase.interface';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class AdminDashboardController {
  constructor(
    @inject('IGetAdminDashboardStatsUsecase')
    private readonly getStatsUsecase: IGetAdminDashboardStatsUsecase,
  ) {}

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.getStatsUsecase.execute();
      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Admin dashboard stats retrieved successfully',
        stats
      );
    } catch (error) {
      next(error);
    }
  }
}
