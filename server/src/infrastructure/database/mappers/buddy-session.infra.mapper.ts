import type { BuddySessionDocument } from '../models/buddy-session.model';
import type { BuddySessionEntity }   from '../../../domain/entities/calender.entities';

export class BuddySessionInfraMapper {

  static toDomain(doc: BuddySessionDocument): BuddySessionEntity {
    return {
      id:                doc._id.toString(),
      conversationId:    doc.conversationId.toString(),
      buddyConnectionId: doc.buddyConnectionId.toString(),
      initiatorId:       doc.initiatorId.toString(),
      participantId:     doc.participantId.toString(),
      status:            doc.status,
      scheduledAt:       doc.scheduledAt   ?? undefined,
      startedAt:         doc.startedAt     ?? undefined,
      endedAt:           doc.endedAt       ?? undefined,
      roomId:            doc.roomId,
      createdAt:         doc.createdAt,
      updatedAt:         doc.updatedAt,
    };
  }
}
