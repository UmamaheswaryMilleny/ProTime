import type { IBaseRepository } from '../base/base.repository.interface';
import type { CalendarEventEntity }  from '../../entities/calender.entities';

export interface ICalendarEventRepository
  extends IBaseRepository<CalendarEventEntity> {

  // Load all calendar events for a user within a date range
  // date stored as YYYY-MM-DD string — range inclusive
  findByUserIdAndDateRange(
    userId: string,
    from:   string,   // YYYY-MM-DD
    to:     string,   // YYYY-MM-DD
  ): Promise<CalendarEventEntity[]>;

  // Get both calendar events linked to a session (one per user)
  findBySessionId(
    sessionId: string,
  ): Promise<CalendarEventEntity[]>;

  // Get calendar event linked to a todo for a specific user
  findByTodoId(
    todoId: string,
    userId: string,
  ): Promise<CalendarEventEntity | null>;

  // updateBySessionId removed — no sync needed, entity is a lightweight pointer
}
