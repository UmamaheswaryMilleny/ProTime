import { inject, injectable } from 'tsyringe';
import type { IGetCalendarEventsUsecase }    from '../../interface/calendar/get-calendar-events.usecase.interface';
import type { ICalendarEventRepository }     from '../../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { GetCalendarEventsRequestDTO }  from '../../../dto/calendar/request/get-calendar-events.request.dto';
import type { GetCalendarEventsResponseDTO } from '../../../dto/calendar/response/get-calendar-events.response.dto';
import { CalendarMapper } from '../../../mapper/calendar.mapper';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class GetCalendarEventsUsecase implements IGetCalendarEventsUsecase {
  constructor(
    @inject('ICalendarEventRepository')
    private readonly eventRepo: ICalendarEventRepository,
  ) {}

  async execute(userId: string, dto: GetCalendarEventsRequestDTO): Promise<GetCalendarEventsResponseDTO> {
    try {
      const events = await this.eventRepo.findByUserIdAndDateRange(userId, dto.from, dto.to);
      
      const mapped = events.map(e => CalendarMapper.eventToResponse(e));
      
      return { events: mapped };
    } catch (err) {
      logger.error('[GetCalendarEventsUsecase] Error:', { error: err });
      throw err;
    }
  }
}
