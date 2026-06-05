import type { ReportStatus, ReportContext, ReportReason, ReportAction } from '../../../../domain/enums/report.enums';

export interface ReportResponseDTO {
  id:                  string;
  reporterId:          string;
  reporter?:           { id: string; fullName: string; email: string; avatar?: string; isBlocked?: boolean };
  reportedUserId:      string;
  reportedUser?:       { id: string; fullName: string; email: string; avatar?: string; isBlocked?: boolean };
  context:             ReportContext;
  reason:              ReportReason;
  additionalDetails?:  string;
  screenshots?:        string[];
  status:              ReportStatus;
  reviewedBy?:         string;
  reviewedAt?:         Date;
  adminNote?:          string;
  actionTaken?:        ReportAction;
  createdAt:           Date;
  updatedAt:           Date;
}