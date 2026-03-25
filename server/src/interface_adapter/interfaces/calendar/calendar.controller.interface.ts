import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface ICalendarController {
  getCalendarEvents(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getDayDetail(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getPendingScheduleRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
