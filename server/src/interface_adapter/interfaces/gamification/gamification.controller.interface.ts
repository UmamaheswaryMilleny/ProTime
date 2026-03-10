import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface IGamificationController {
  getGamification(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}