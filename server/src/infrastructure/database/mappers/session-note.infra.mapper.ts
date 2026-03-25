import type { SessionNoteDocument } from '../models/session-note.model';
import type { SessionNoteEntity }   from '../../../domain/entities/calender.entities';

export class SessionNoteInfraMapper {

  static toDomain(doc: SessionNoteDocument): SessionNoteEntity {
    return {
      id:        doc._id.toString(),
      sessionId: doc.sessionId.toString(),
      userId:    doc.userId.toString(),
      content:   doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
