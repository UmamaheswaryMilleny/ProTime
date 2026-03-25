import type { SessionScheduleRequestDocument } from '../models/session-shedule-request.model';
import type { SessionScheduleRequestEntity } from '../../../domain/entities/calender.entities';

export class SessionScheduleRequestInfraMapper {

  static toDomain(doc: SessionScheduleRequestDocument): SessionScheduleRequestEntity {
    return {
      id: doc._id.toString(),
      sessionId: doc.sessionId?.toString(),
      proposedBy: doc.proposedBy.toString(),
      proposedTo: doc.proposedTo.toString(),
      scheduledAt: doc.scheduledAt,
      recurringDates: doc.recurringDates || [],
      durationMinutes: doc.durationMinutes || 0,
      confirmStatus: doc.confirmStatus,
      expiresAt: doc.expiresAt,
      respondedAt: doc.respondedAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
