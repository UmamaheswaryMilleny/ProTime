import { ReportStatus, ReportContext, ReportReason, ReportAction } from '../enums/report.enums';


// ─── ReportEntity ─────────────────────────────────────────────────────────────
// Created when a user reports another user from Chat or Video Call.
// Admin reviews and either resolves with an action or dismisses.
// Admin fields (reviewedBy, reviewedAt, adminNote, actionTaken) are set
// when admin calls resolve — null/undefined when still PENDING.
export interface ReportEntity {
  id:                  string;
  reporterId:          string;         // userId who submitted the report
  reportedUserId:      string;         // userId who was reported — renamed for clarity
  context:             ReportContext;
  reason:              ReportReason;
  additionalDetails?:  string;         // optional extra detail from reporter
  status:              ReportStatus;
  // ─── Admin review fields ──────────────────────────────────────────────────
  reviewedBy?:         string;         // adminId who reviewed
  reviewedAt?:         Date;           // when admin reviewed
  adminNote?:          string;         // admin internal note
  actionTaken?:        ReportAction;   // what the admin did
  createdAt:           Date;
  updatedAt:           Date;
}