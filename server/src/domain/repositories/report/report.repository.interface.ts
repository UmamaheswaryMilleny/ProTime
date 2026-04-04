import type { IBaseRepository } from '../base/base.repository.interface';
import type { ReportEntity }    from '../../entities/report.entity';
import type { ReportStatus }    from '../../enums/report.enums';

export interface IReportRepository
  extends IBaseRepository<ReportEntity> {

findAll(params: {
  status?:         ReportStatus;
  reportedUserId?: string;
  search?:         string;
  page:            number;
  limit:           number;
}): Promise<{ reports: ReportEntity[]; total: number }>;
  // Admin — single report detail
  findById(id: string): Promise<ReportEntity | null>;

  // Admin — update all review fields at once
  resolveReport(
    id:   string,
    data: Partial<Pick<ReportEntity,
      | 'status'
      | 'reviewedBy'
      | 'reviewedAt'
      | 'adminNote'
      | 'actionTaken'
    >>,
  ): Promise<ReportEntity | null>;

  // Duplicate check — only blocks if PENDING report already exists
  // Allows reporting after previous report is resolved/dismissed
  findPendingReport(
    reporterId:     string,
    reportedUserId: string,
  ): Promise<ReportEntity | null>;

  // Count total reports against a user — admin insight
  countByReportedUser(reportedUserId: string): Promise<number>;
}