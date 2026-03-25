import mongoose, { Document, Model } from 'mongoose';
import { ReportSchema } from '../schema/report.schema';
import type { ReportStatus, ReportContext, ReportReason, ReportAction } from '../../../domain/enums/report.enums';

export interface ReportDocument extends Document {
  reporterId:        mongoose.Types.ObjectId;
  reportedUserId:    mongoose.Types.ObjectId;
  context:           ReportContext;
  reason:            ReportReason;
  additionalDetails: string | null;
  status:            ReportStatus;
  reviewedBy:        mongoose.Types.ObjectId | null;
  reviewedAt:        Date | null;
  adminNote:         string | null;
  actionTaken:       ReportAction | null;
  createdAt:         Date;
  updatedAt:         Date;
}

export const ReportModel: Model<ReportDocument> =
  mongoose.models.Report ||
  mongoose.model<ReportDocument>('Report', ReportSchema);