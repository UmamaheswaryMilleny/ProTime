import type { SubmitReportRequestDTO } from '../../../dto/report/request/submit-report.request.dto';
import type { ReportResponseDTO } from '../../../dto/report/response/report.response.dto';

export interface ISubmitReportUsecase {
  execute(
    reporterId: string,
    dto:        SubmitReportRequestDTO,
  ): Promise<ReportResponseDTO>;
}