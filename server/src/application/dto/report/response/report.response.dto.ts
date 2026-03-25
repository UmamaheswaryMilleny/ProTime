import type { ReportStatus, ReportContext, ReportReason, ReportAction } from '../../../../domain/enums/report.enums';

export interface ReportResponseDTO {
  id:                  string;
  reporterId:          string;
  reportedUserId:      string;
  context:             ReportContext;
  reason:              ReportReason;
  additionalDetails?:  string;
  status:              ReportStatus;
  reviewedBy?:         string;
  reviewedAt?:         Date;
  adminNote?:          string;
  actionTaken?:        ReportAction;
  createdAt:           Date;
  updatedAt:           Date;
}