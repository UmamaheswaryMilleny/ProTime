import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { IReportController }       from '../../interfaces/report/report.controller.interface';
import type { ISubmitReportUsecase }    from '../../../application/usecase/interface/report/submit-report.usecase.interface';
import type { IResolveReportUsecase }   from '../../../application/usecase/interface/report/resolve-report.usecase.interface';
import type { IGetReportsUsecase }      from '../../../application/usecase/interface/report/get-reports.usecase.interface';
import type { IGetReportByIdUsecase }   from '../../../application/usecase/interface/report/get-report-by-id.usecase.interface';
import type { CustomRequest }           from '../../middlewares/auth.middleware';
import type { SubmitReportRequestDTO }  from '../../../application/dto/report/request/submit-report.request.dto';
import type { ResolveReportRequestDTO } from '../../../application/dto/report/request/resolve-report.request.dto';
import type { GetReportsRequestDTO }    from '../../../application/dto/report/request/get-reports.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';
import { ReportStatus } from '../../../domain/enums/report.enums';

@injectable()
export class ReportController implements IReportController {
  constructor(
    @inject('ISubmitReportUsecase')
    private readonly submitReportUsecase: ISubmitReportUsecase,

    @inject('IResolveReportUsecase')
    private readonly resolveReportUsecase: IResolveReportUsecase,

    @inject('IGetReportsUsecase')
    private readonly getReportsUsecase: IGetReportsUsecase,

    @inject('IGetReportByIdUsecase')
    private readonly getReportByIdUsecase: IGetReportByIdUsecase,
  ) {}

  // ─── POST /api/v1/reports ─────────────────────────────────────────────────
  async submitReport(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reporterId = req.user!.id;
      const dto        = req.body as SubmitReportRequestDTO;
      const result     = await this.submitReportUsecase.execute(reporterId, dto);
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Report submitted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/admin/reports ────────────────────────────────────────────
async getReports(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto: GetReportsRequestDTO = {
      status:         req.query.status         as ReportStatus | undefined,
      reportedUserId: req.query.reportedUserId as string       | undefined,
      page:           Number(req.query.page)   || 1,
      limit:          Number(req.query.limit)  || 20,
    };
    const result = await this.getReportsUsecase.execute(dto);
    ResponseHelper.success(res, HTTP_STATUS.OK, 'Reports fetched successfully', result);
  } catch (error) {
    next(error);
  }
}

  // ─── GET /api/v1/admin/reports/:reportId ──────────────────────────────────
  async getReportById(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reportId = req.params.reportId as string;
      const result   = await this.getReportByIdUsecase.execute(reportId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Report fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── PATCH /api/v1/admin/reports/:reportId/resolve ────────────────────────
  async resolveReport(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const adminId  = req.user!.id;
      const reportId = req.params.reportId as string;
      const dto      = req.body as ResolveReportRequestDTO;
      const result   = await this.resolveReportUsecase.execute(adminId, reportId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Report resolved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}