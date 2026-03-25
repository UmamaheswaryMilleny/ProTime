import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface IReportController {
  submitReport(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getReports(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getReportById(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  resolveReport(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}