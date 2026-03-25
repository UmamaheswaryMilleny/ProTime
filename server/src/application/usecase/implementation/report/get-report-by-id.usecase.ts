import { inject, injectable } from 'tsyringe';
import type { IGetReportByIdUsecase } from '../../interface/report/get-report-by-id.usecase.interface';
import type { IReportRepository }     from '../../../../domain/repositories/report/report.repository.interface';
import type { ReportResponseDTO }     from '../../../dto/report/response/report.response.dto';
import { ReportNotFoundError }        from '../../../../domain/errors/report.errors';
import { ReportMapper }               from '../../../mapper/report.mapper';

@injectable()
export class GetReportByIdUsecase implements IGetReportByIdUsecase {
  constructor(
    @inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(reportId: string): Promise<ReportResponseDTO> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new ReportNotFoundError();
    return ReportMapper.toResponse(report);
  }
}