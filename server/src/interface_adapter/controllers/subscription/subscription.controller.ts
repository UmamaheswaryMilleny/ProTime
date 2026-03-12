import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { ISubscriptionController } from '../../interfaces/subscription/subscription.controller.interface';
import type { IGetSubscriptionUsecase } from '../../../application/usecase/interface/subscription/get-subscription.usecase.interface';
import type { ICreateCheckoutSessionUsecase } from '../../../application/usecase/interface/subscription/create-checkout-session.usecase.interface';
import type { ICancelSubscriptionUsecase } from '../../../application/usecase/interface/subscription/cancel-subscription.usecase.interface';
import type { IHandleStripeWebhookUsecase } from '../../../application/usecase/interface/subscription/handle-stripe-webhook.usecase.interface';
import type { CustomRequest } from '../../middlewares/auth.middleware';
import type { CreateCheckoutSessionRequestDTO } from '../../../application/dto/subscription/request/create-checkout-session.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject('IGetSubscriptionUsecase')
    private readonly getSubscriptionUsecase: IGetSubscriptionUsecase,

    @inject('ICreateCheckoutSessionUsecase')
    private readonly createCheckoutSessionUsecase: ICreateCheckoutSessionUsecase,

    @inject('ICancelSubscriptionUsecase')
    private readonly cancelSubscriptionUsecase: ICancelSubscriptionUsecase,

    @inject('IHandleStripeWebhookUsecase')
    private readonly handleStripeWebhookUsecase: IHandleStripeWebhookUsecase,
  ) { }

  // ─── GET /api/v1/subscription ─────────────────────────────────────────────
  async getSubscription(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getSubscriptionUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Subscription fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/subscription/checkout ───────────────────────────────────
  async createCheckoutSession(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const dto = req.body as CreateCheckoutSessionRequestDTO;

      const result = await this.createCheckoutSessionUsecase.execute(userId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Checkout session created', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/subscription/cancel ─────────────────────────────────────
  async cancelSubscription(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.cancelSubscriptionUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Subscription cancelled successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/subscription/webhook ────────────────────────────────────
  // No auth — Stripe calls this directly with a raw Buffer body.
  // express.raw() must be applied on this route before express.json().
  async handleWebhook(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const rawBody = req.body as Buffer;

      await this.handleStripeWebhookUsecase.execute(rawBody, signature);

      // Stripe requires 200 — any non-2xx triggers a retry
      res.status(HTTP_STATUS.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}