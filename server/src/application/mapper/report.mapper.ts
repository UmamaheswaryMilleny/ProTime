import type { ReportEntity }      from '../../domain/entities/report.entity';
import type { ReportResponseDTO } from '../dto/report/response/report.response.dto';

export class ReportMapper {

  static toResponse(entity: ReportEntity): ReportResponseDTO {
    return {
      id:                 entity.id,
      reporterId:         entity.reporterId,
      reportedUserId:     entity.reportedUserId,
      context:            entity.context,
      reason:             entity.reason,
      additionalDetails:  entity.additionalDetails,
      status:             entity.status,
      reviewedBy:         entity.reviewedBy,
      reviewedAt:         entity.reviewedAt,
      adminNote:          entity.adminNote,
      actionTaken:        entity.actionTaken,
      createdAt:          entity.createdAt,
      updatedAt:          entity.updatedAt,
    };
  }
}