import { injectable } from 'tsyringe';
import { container } from 'tsyringe';
import express from 'express';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { SubscriptionController } from '../../controllers/subscription/subscription.controller';
import { CreateCheckoutSessionRequestDTO } from '../../../application/dto/subscription/request/create-checkout-session.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class SubscriptionRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(SubscriptionController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    // ─── Webhook ──────────────────────────────────────────────────────────
    // MUST be registered BEFORE express.json() is applied on this router
    // express.raw() gives us the raw Buffer that Stripe requires for signature verification
    // No auth — Stripe calls this directly with its own signature
    this.router.post(
      '/webhook',
      asyncHandler(ctrl.handleWebhook.bind(ctrl)),
    );

    // ─── Authenticated Routes ─────────────────────────────────────────────
    // All routes below require valid JWT + CLIENT role + not blocked
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // GET /api/v1/subscription/me
    this.router.get(
      '/me',
      asyncHandler(ctrl.getSubscription.bind(ctrl)),
    );

    // POST /api/v1/subscription/checkout
    this.router.post(
      '/checkout',
      validationMiddleware(CreateCheckoutSessionRequestDTO),
      asyncHandler(ctrl.createCheckoutSession.bind(ctrl)),
    );

    // POST /api/v1/subscription/cancel
    this.router.post(
      '/cancel',
      asyncHandler(ctrl.cancelSubscription.bind(ctrl)),
    );
  }
}