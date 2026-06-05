import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { CustomRequest }              from '../../middlewares/auth.middleware';
import type { IGetProductivityReportUsecase, ReportRange } from '../../../application/usecase/interface/todo/get-productivity-report.usecase.interface';
import { ResponseHelper }  from '../../helpers/response.helper';
import { HTTP_STATUS }     from '../../../shared/constants/constants';
import { UserModel }       from '../../../infrastructure/database/models/user.model';

@injectable()
export class ProductivityReportController {
  constructor(
    @inject('IGetProductivityReportUsecase')
    private readonly getProductivityReportUsecase: IGetProductivityReportUsecase,
  ) {}

  // ─── GET /api/v1/reports/productivity?range=7days|30days ──────────────────
  async getReport(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const range  = (req.query.range as ReportRange) || '7days';
      const month  = req.query.month as string | undefined;
      const data   = await this.getProductivityReportUsecase.execute(userId, range, month);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Productivity report fetched', data);
    } catch (error: unknown) {
      next(error);
    }
  }

  // ─── GET /api/v1/reports/productivity/export?format=csv&range=... ─────────
  async exportReport(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await UserModel.findById(userId).lean();
      const isPremium = user?.isPremium ?? false;

      if (!isPremium) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Exporting reports is a Premium feature. Please upgrade to unlock.'
        });
        return;
      }

      const range  = (req.query.range as ReportRange) || '7days';
      const month  = req.query.month as string | undefined;
      const format = (req.query.format as string)?.toLowerCase() || 'csv';

      const data = await this.getProductivityReportUsecase.execute(userId, range, month);

      if (format === 'csv') {
        // Build CSV
        const header  = ['Task Name', 'Priority', 'Status', 'Pomodoro Used', 'XP Earned', 'Date'].join(',');
        const rows    = data.tasks.map(t =>
          [
            `"${t.name.replace(/"/g, '""')}"`,
            t.priority,
            t.status,
            t.pomodoroUsed ? 'Yes' : 'No',
            t.xpEarned,
            t.date,
          ].join(','),
        );

        const summarySection = [
          '',
          '--- Summary ---',
          `Total XP,${data.summary.totalXp}`,
          `Current Streak,${data.summary.currentStreak} days`,
          `Level,${data.summary.currentLevel} - ${data.summary.currentTitle}`,
          `Tasks Completed,${data.summary.tasksCompleted}`,
          `Focus Time,${Math.floor(data.summary.totalFocusMinutes / 60)}h ${data.summary.totalFocusMinutes % 60}m`,
          `Rooms Joined,${data.summary.roomsJoined}`,
        ];

        const csv = [header, ...rows, ...summarySection].join('\n');
        const filenameRange = month ? month : range;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="protime-report-${filenameRange}-${new Date().toISOString().slice(0, 10)}.csv"`);
        res.status(HTTP_STATUS.OK).send(csv);
        return;
      }

      // Unsupported format fallback — return JSON
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Report data', data);
    } catch (error: unknown) {
      next(error);
    }
  }
}
