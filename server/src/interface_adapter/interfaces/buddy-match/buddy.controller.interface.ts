import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface IBuddyController {
  savePreference(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getPreference(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  findMatches(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  sendRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  respondToRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getBuddyList(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getPendingRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}