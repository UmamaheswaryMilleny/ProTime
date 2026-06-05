import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionStatsUsecase } from '../../../application/usecase/interface/subscription/get-subscription-stats.usecase.interface';
import type { IGetSubscriptionsAdminUsecase } from '../../../application/usecase/interface/subscription/get-subscriptions-admin.usecase.interface';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription/subscription.repository.interface';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class AdminSubscriptionController {
  constructor(
    @inject('IGetSubscriptionStatsUsecase')
    private readonly getStatsUsecase: IGetSubscriptionStatsUsecase,

    @inject('IGetSubscriptionsAdminUsecase')
    private readonly getSubscriptionsUsecase: IGetSubscriptionsAdminUsecase,

    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
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

  // ─── Update subscription for a user (admin override) ──────────────────────
  async updateSubscription(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.params.userId as string;
    const { plan, status, currentPeriodEnd } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    const existing = await this.subscriptionRepository.findByUserId(userId);
    const currentPlan = existing?.plan || 'FREE';
    const currentStatus = existing?.status || 'ACTIVE';

    const targetPlan = plan ? plan.toUpperCase() : currentPlan;
    const targetStatus = status ? status.toUpperCase() : currentStatus;

    let hasDateChanged = false;
    if (currentPeriodEnd && existing?.currentPeriodEnd) {
      const newDate = new Date(currentPeriodEnd).toISOString().slice(0, 10);
      const oldDate = new Date(existing.currentPeriodEnd).toISOString().slice(0, 10);
      if (newDate !== oldDate) {
        hasDateChanged = true;
      }
    }

    if (!hasDateChanged) {
      if (targetPlan === 'FREE' && currentPlan === 'FREE') {
        res.status(400).json({ success: false, message: 'User is already on the Free plan' });
        return;
      }
      if (targetPlan === 'PREMIUM' && currentPlan === 'PREMIUM' && targetStatus === currentStatus) {
        res.status(400).json({ success: false, message: `User is already on the Premium plan with ${targetStatus.toLowerCase()} status` });
        return;
      }
    }

    const updateData: Record<string, any> = {};
    if (plan)            updateData.plan = plan.toUpperCase();
    if (status)          updateData.status = status.toUpperCase();
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = new Date(currentPeriodEnd);
      updateData.currentPeriodStart = new Date();
    }

    const updated = await this.subscriptionRepository.updateByUserId(userId, updateData);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      'Subscription updated successfully',
      updated,
    );
  }

  // ─── Manually assign / create subscription for a user ─────────────────────
  async addSubscription(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { userId, plan, status, currentPeriodEnd } = req.body;

    if (!userId || !plan) {
      res.status(400).json({ success: false, message: 'userId and plan are required' });
      return;
    }

    const existing = await this.subscriptionRepository.findByUserId(userId);
    const currentPlan = existing?.plan || 'FREE';
    const currentStatus = existing?.status || 'ACTIVE';

    const targetPlan = plan.toUpperCase();
    const targetStatus = (status || 'ACTIVE').toUpperCase();

    if (targetPlan === 'FREE' && currentPlan === 'FREE') {
      res.status(400).json({ success: false, message: 'User is already on the Free plan' });
      return;
    }
    if (targetPlan === 'PREMIUM' && currentPlan === 'PREMIUM' && targetStatus === currentStatus) {
      res.status(400).json({ success: false, message: `User is already on the Premium plan with ${targetStatus.toLowerCase()} status` });
      return;
    }

    const periodStart = new Date();
    const periodEnd   = currentPeriodEnd ? new Date(currentPeriodEnd) : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d;
    })();

    const subscription = await this.subscriptionRepository.updateByUserId(userId, {
      plan: targetPlan,
      status: targetStatus,
      currentPeriodStart: periodStart,
      currentPeriodEnd:   periodEnd,
    });

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      'Subscription created / assigned successfully',
      subscription,
    );
  }
}
