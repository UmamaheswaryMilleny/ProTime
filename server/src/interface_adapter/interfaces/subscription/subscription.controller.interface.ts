import type { Request, Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface ISubscriptionController {
  getSubscription(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  createCheckoutSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  cancelSubscription(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
}