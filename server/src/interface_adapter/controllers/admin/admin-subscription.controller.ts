import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { PlanModel } from '../../../infrastructure/database/models/plan.model';

import type { IGetSubscriptionStatsUsecase } from '../../../application/usecase/interface/subscription/get-subscription-stats.usecase.interface';
import type { IGetSubscriptionsAdminUsecase } from '../../../application/usecase/interface/subscription/get-subscriptions-admin.usecase.interface';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription/subscription.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user/user.repository.interface';
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

    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
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
      if (targetPlan === currentPlan && targetStatus === currentStatus) {
        res.status(400).json({ success: false, message: `User is already on the ${targetPlan} plan with ${targetStatus.toLowerCase()} status` });
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

    if (updated) {
      const isPremiumUser = updated.plan !== 'FREE' && (updated.status === 'ACTIVE' || updated.status === 'CANCELLED');
      await this.userRepository.updateById(userId, { isPremium: isPremiumUser });
    }

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

    if (targetPlan === currentPlan && targetStatus === currentStatus) {
      res.status(400).json({ success: false, message: `User is already on the ${targetPlan} plan with ${targetStatus.toLowerCase()} status` });
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

    if (subscription) {
      const isPremiumUser = subscription.plan !== 'FREE' && (subscription.status === 'ACTIVE' || subscription.status === 'CANCELLED');
      await this.userRepository.updateById(userId, { isPremium: isPremiumUser });
    }

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      'Subscription created / assigned successfully',
      subscription,
    );
  }

  // ─── Delete subscription (reset to free) ──────────────────────────────────
  async deleteSubscription(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }
    const deleted = await this.subscriptionRepository.deleteByUserId(userId);
    await this.userRepository.updateById(userId, { isPremium: false });
    
    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
      data: { deleted },
    });
  }

  // ─── Plans CRUD ───────────────────────────────────────────────────────────
  async getPlans(req: Request, res: Response): Promise<void> {
    const plans = await PlanModel.find().lean();
    res.status(200).json({ success: true, data: plans });
  }

  async createPlan(req: Request, res: Response): Promise<void> {
    const { name, code, price, features } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Plan name and code are required' });
      return;
    }
    const codeUpper = code.toUpperCase();
    const existing = await PlanModel.findOne({ code: codeUpper });
    if (existing) {
      res.status(400).json({ success: false, message: `Plan with code ${codeUpper} already exists` });
      return;
    }
    const plan = await PlanModel.create({
      name,
      code: codeUpper,
      price: Number(price) || 0,
      features: Array.isArray(features) ? features : [],
    });
    res.status(201).json({ success: true, data: plan });
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    const planId = req.params.planId;
    const { name, code, price, features, isActive } = req.body;
    const plan = await PlanModel.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    if (name) plan.name = name;
    if (code) {
      const codeUpper = code.toUpperCase();
      if (codeUpper !== plan.code) {
        const existing = await PlanModel.findOne({ code: codeUpper });
        if (existing) {
          res.status(400).json({ success: false, message: `Plan with code ${codeUpper} already exists` });
          return;
        }
        plan.code = codeUpper;
      }
    }
    if (price !== undefined) plan.price = Number(price);
    if (features !== undefined) plan.features = Array.isArray(features) ? features : [];
    if (isActive !== undefined) plan.isActive = !!isActive;

    await plan.save();
    res.status(200).json({ success: true, data: plan });
  }

  async deletePlan(req: Request, res: Response): Promise<void> {
    const planId = req.params.planId;
    const plan = await PlanModel.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    if (plan.code === 'FREE' || plan.code === 'PREMIUM') {
      res.status(400).json({ success: false, message: 'Default FREE and PREMIUM plans cannot be deleted' });
      return;
    }
    await PlanModel.deleteOne({ _id: planId });
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  }
}
