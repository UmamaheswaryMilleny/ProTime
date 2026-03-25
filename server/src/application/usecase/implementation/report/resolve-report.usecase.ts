import { inject, injectable } from 'tsyringe';
import type { IResolveReportUsecase }  from '../../interface/report/resolve-report.usecase.interface';
import type { IReportRepository }      from '../../../../domain/repositories/report/report.repository.interface';
import type { IUserRepository }        from '../../../../domain/repositories/user/user.repository.interface';
import type { ResolveReportRequestDTO } from '../../../dto/report/request/resolve-report.request.dto';
import type { ReportResponseDTO }      from '../../../dto/report/response/report.response.dto';
import {
  ReportNotFoundError,
} from '../../../../domain/errors/report.errors';
import { ReportStatus, ReportAction } from '../../../../domain/enums/report.enums';
import { ReportMapper } from '../../../mapper/report.mapper';

@injectable()
export class ResolveReportUsecase implements IResolveReportUsecase {
  constructor(
    @inject('IReportRepository')
    private readonly reportRepo: IReportRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    adminId:  string,
    reportId: string,
    dto:      ResolveReportRequestDTO,
  ): Promise<ReportResponseDTO> {

    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new ReportNotFoundError();

    // If action is PERMANENT_BLOCK or TEMPORARY_BLOCK — block the reported user
    if (
      dto.actionTaken === ReportAction.PERMANENT_BLOCK ||
      dto.actionTaken === ReportAction.TEMPORARY_BLOCK
    ) {
      await this.userRepo.updateById(report.reportedUserId, {
        isBlocked: true,
      });
    }

    const resolved = await this.reportRepo.resolveReport(reportId, {
      status:      dto.status,
      reviewedBy:  adminId,
      reviewedAt:  new Date(),
      adminNote:   dto.adminNote,
      actionTaken: dto.actionTaken,
    });

    return ReportMapper.toResponse(resolved ?? report);
  }
}