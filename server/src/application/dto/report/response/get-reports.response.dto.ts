import type { ReportResponseDTO } from './report.response.dto';

export interface GetReportsResponseDTO {
  reports: ReportResponseDTO[];
  total:   number;
  page:    number;
  limit:   number;
}