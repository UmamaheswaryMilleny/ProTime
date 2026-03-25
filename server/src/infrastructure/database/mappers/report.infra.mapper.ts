import type { ReportDocument } from '../models/report.model';
import type { ReportEntity }   from '../../../domain/entities/report.entity';

export class ReportInfraMapper {

  static toDomain(doc: ReportDocument): ReportEntity {
    return {
      id:                doc._id.toString(),
      reporterId:        doc.reporterId.toString(),
      reportedUserId:    doc.reportedUserId.toString(),
      context:           doc.context,
      reason:            doc.reason,
      additionalDetails: doc.additionalDetails ?? undefined,
      status:            doc.status,
      reviewedBy:        doc.reviewedBy?.toString()  ?? undefined,
      reviewedAt:        doc.reviewedAt              ?? undefined,
      adminNote:         doc.adminNote               ?? undefined,
      actionTaken:       doc.actionTaken             ?? undefined,
      createdAt:         doc.createdAt,
      updatedAt:         doc.updatedAt,
    };
  }
}