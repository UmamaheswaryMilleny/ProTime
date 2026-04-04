import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionStatsUsecase } from '../../../application/usecase/interface/subscription/get-subscription-stats.usecase.interface';
import type { IGetSubscriptionsAdminUsecase } from '../../../application/usecase/interface/subscription/get-subscriptions-admin.usecase.interface';

@injectable()
export class AdminSubscriptionController {
  constructor(
    @inject('IGetSubscriptionStatsUsecase')
    private readonly getStatsUsecase: IGetSubscriptionStatsUsecase,

    @inject('IGetSubscriptionsAdminUsecase')
    private readonly getSubscriptionsUsecase: IGetSubscriptionsAdminUsecase,
  ) {}

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await this.getStatsUsecase.execute();
    res.status(200).json({
      success: true,
      data: stats,
    });
  }

  async getSubscriptions(req: Request, res: Response): Promise<void> {
    const { plan, status, search, page, limit } = req.query;

    const result = await this.getSubscriptionsUsecase.execute({
      plan:   plan   as string,
      status: status as string,
      search: search as string,
      page:   Number(page)  || 1,
      limit:  Number(limit) || 10,
    });

    res.status(200).json({
      success: true,
      data:    result,
    });
  }
}
