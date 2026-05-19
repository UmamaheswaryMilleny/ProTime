import type { IBaseRepository } from '../base/base.repository.interface';
import type { CalendarEventEntity }  from '../../entities/calender.entities';

export interface ICalendarEventRepository
  extends IBaseRepository<CalendarEventEntity> {


  findByUserIdAndDateRange(
    userId: string,
    from:   string,  
    to:     string,   
  ): Promise<CalendarEventEntity[]>;


  findBySessionId(
    sessionId: string,
  ): Promise<CalendarEventEntity[]>;


  findByTodoId(
    todoId: string,
    userId: string,
  ): Promise<CalendarEventEntity | null>;

  
}
