import type { ReportDocument } from '../models/report.model';
import type { ReportEntity }   from '../../../domain/entities/report.entity';

export class ReportInfraMapper {

  static toDomain(doc: any): ReportEntity {
    // When .populate() resolves, the field becomes an object with user fields.
    // Detect this by checking if the field has the `fullName` property.
    const isPopulated = (field: any) => field && typeof field === 'object' && field.fullName;

    let reporterObj = undefined;
    if (isPopulated(doc.reporterId)) {
      reporterObj = {
        id:       doc.reporterId._id?.toString(),
        fullName: doc.reporterId.fullName,
        email:    doc.reporterId.email,
        avatar:   doc.reporterId.avatar,
      };
    }

    let reportedUserObj = undefined;
    if (isPopulated(doc.reportedUserId)) {
      reportedUserObj = {
        id:       doc.reportedUserId._id?.toString(),
        fullName: doc.reportedUserId.fullName,
        email:    doc.reportedUserId.email,
        avatar:   doc.reportedUserId.avatar,
      };
    }

    const safeReporterId = isPopulated(doc.reporterId)
      ? doc.reporterId._id?.toString()
      : doc.reporterId?.toString() || 'unknown';

    const safeReportedUserId = isPopulated(doc.reportedUserId)
      ? doc.reportedUserId._id?.toString()
      : doc.reportedUserId?.toString() || 'unknown';

    return {
      id:                doc._id?.toString(),
      reporterId:        safeReporterId,
      reporter:          reporterObj,
      reportedUserId:    safeReportedUserId,
      reportedUser:      reportedUserObj,
      context:           doc.context,
      reason:            doc.reason,
      additionalDetails: doc.additionalDetails ?? undefined,
      screenshots:       doc.screenshots?.length ? doc.screenshots : undefined,
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