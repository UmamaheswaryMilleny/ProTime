import type { CalendarEventDocument } from '../models/calendar-event.model';
import type { CalendarEventEntity }   from '../../../domain/entities/calender.entities';

export class CalendarEventInfraMapper {

  static toDomain(doc: CalendarEventDocument): CalendarEventEntity {
    return {
      id:        doc._id.toString(),
      userId:    doc.userId.toString(),
      type:      doc.type,
      date:      doc.date,
      title:     doc.title,
      startTime: doc.startTime ?? undefined,
      sessionId: doc.sessionId?.toString() ?? undefined,
      todoId:    doc.todoId?.toString()    ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
