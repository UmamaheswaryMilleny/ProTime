import type { ReportResponseDTO } from "../../../dto/report/response/report.response.dto";

export interface IGetReportByIdUsecase {
  execute(reportId: string): Promise<ReportResponseDTO>;
}