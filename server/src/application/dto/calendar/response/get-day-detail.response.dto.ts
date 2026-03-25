import type { CalendarEventResponseDTO } from './calendar-event.response.dto';

export interface GetDayDetailResponseDTO {
  date:    string;
  events:  CalendarEventResponseDTO[];
}
