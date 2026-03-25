import type { GetCalendarEventsRequestDTO }  from '../../../dto/calendar/request/get-calendar-events.request.dto';
import type { GetCalendarEventsResponseDTO } from '../../../dto/calendar/response/get-calendar-events.response.dto';

export interface IGetCalendarEventsUsecase {
  execute(
    userId: string,
    dto:    GetCalendarEventsRequestDTO,
  ): Promise<GetCalendarEventsResponseDTO>;
}
