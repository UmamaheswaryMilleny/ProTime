import { inject, injectable } from 'tsyringe';
import type { ISubmitReportUsecase }  from '../../interface/report/submit-report.usecase.interface';
import type { IReportRepository }     from '../../../../domain/repositories/report/report.repository.interface';
import type { IUserRepository }       from '../../../../domain/repositories/user/user.repository.interface';
import type { SubmitReportRequestDTO } from '../../../dto/report/request/submit-report.request.dto';
import type { ReportResponseDTO }     from '../../../dto/report/response/report.response.dto';
import {
  SelfReportError,
  DuplicateReportError,
} from '../../../../domain/errors/report.errors';
import { UserNotFoundError } from '../../../../domain/errors/user.error';
import { ReportStatus } from '../../../../domain/enums/report.enums';
import { ReportMapper } from '../../../mapper/report.mapper';

@injectable()
export class SubmitReportUsecase implements ISubmitReportUsecase {
  constructor(
    @inject('IReportRepository')
    private readonly reportRepo: IReportRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    reporterId: string,
    dto:        SubmitReportRequestDTO,
  ): Promise<ReportResponseDTO> {

    // Cannot report yourself
    if (reporterId === dto.reportedUserId) throw new SelfReportError();

    // Reported user must exist
    const reportedUser = await this.userRepo.findById(dto.reportedUserId);
    if (!reportedUser) throw new UserNotFoundError();

    // Only block duplicate if PENDING report already exists
    const existing = await this.reportRepo.findPendingReport(
      reporterId,
      dto.reportedUserId,
    );
    if (existing) throw new DuplicateReportError();

    const report = await this.reportRepo.save({
      reporterId,
      reportedUserId:    dto.reportedUserId,
      context:           dto.context,
      reason:            dto.reason,
      additionalDetails: dto.additionalDetails,
      screenshots:       dto.screenshots,
      blockUser:         dto.blockUser,
      receiveUpdates:    dto.receiveUpdates,
      status:            ReportStatus.PENDING,
    });

    return ReportMapper.toResponse(report);
  }
}