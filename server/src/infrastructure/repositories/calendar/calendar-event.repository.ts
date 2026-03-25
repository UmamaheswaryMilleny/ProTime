import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { CalendarEventModel, CalendarEventDocument } from '../../database/models/calendar-event.model';
import { CalendarEventInfraMapper } from '../../database/mappers/calendar-event.infra.mapper';
import type { ICalendarEventRepository } from '../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { CalendarEventEntity }      from '../../../domain/entities/calender.entities';

@injectable()
export class CalendarEventRepository
  extends BaseRepository<CalendarEventDocument, CalendarEventEntity>
  implements ICalendarEventRepository
{
  constructor() {
    super(CalendarEventModel, CalendarEventInfraMapper.toDomain);
  }

  // Inclusive date range — both from and to included
  async findByUserIdAndDateRange(
    userId: string,
    from:   string,
    to:     string,
  ): Promise<CalendarEventEntity[]> {
    const docs = await CalendarEventModel
      .find({
        userId,
        date: { $gte: from, $lte: to },
      })
      .sort({ date: 1, startTime: 1 })
      .lean();
    return docs.map(d => CalendarEventInfraMapper.toDomain(d as CalendarEventDocument));
  }

  // Both users' events for a session (one per user)
  async findBySessionId(
    sessionId: string,
  ): Promise<CalendarEventEntity[]> {
    const docs = await CalendarEventModel
      .find({ sessionId })
      .lean();
    return docs.map(d => CalendarEventInfraMapper.toDomain(d as CalendarEventDocument));
  }

  // Single user's event for a todo
  async findByTodoId(
    todoId: string,
    userId: string,
  ): Promise<CalendarEventEntity | null> {
    const doc = await CalendarEventModel.findOne({ todoId, userId }).lean();
    if (!doc) return null;
    return CalendarEventInfraMapper.toDomain(doc as CalendarEventDocument);
  }
}
