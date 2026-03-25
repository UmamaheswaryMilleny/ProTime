import type { ResolveReportRequestDTO } from '../../../dto/report/request/resolve-report.request.dto';
import type { ReportResponseDTO } from '../../../dto/report/response/report.response.dto';

export interface IResolveReportUsecase {
  execute(
    adminId:  string,   // ← added — record who resolved
    reportId: string,
    dto:      ResolveReportRequestDTO,
  ): Promise<ReportResponseDTO>;
}