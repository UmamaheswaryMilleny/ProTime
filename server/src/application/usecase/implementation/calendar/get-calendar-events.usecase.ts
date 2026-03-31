import { inject, injectable } from 'tsyringe';
import type { IGetCalendarEventsUsecase }    from '../../interface/calendar/get-calendar-events.usecase.interface';
import type { ICalendarEventRepository }     from '../../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { IBuddyConnectionRepository }   from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IBuddySessionRepository }      from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { IUserRepository }              from '../../../../domain/repositories/user/user.repository.interface';
import { CalendarEventType }                 from '../../../../domain/enums/calendar.enums';
import type { GetCalendarEventsRequestDTO }  from '../../../dto/calendar/request/get-calendar-events.request.dto';
import type { GetCalendarEventsResponseDTO } from '../../../dto/calendar/response/get-calendar-events.response.dto';
import { CalendarMapper } from '../../../mapper/calendar.mapper';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class GetCalendarEventsUsecase implements IGetCalendarEventsUsecase {
  constructor(
    @inject('ICalendarEventRepository')
    private readonly eventRepo: ICalendarEventRepository,

    @inject('IBuddyConnectionRepository')
    private readonly connectionRepo: IBuddyConnectionRepository,

    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string, dto: GetCalendarEventsRequestDTO): Promise<GetCalendarEventsResponseDTO> {
    try {
      const events = await this.eventRepo.findByUserIdAndDateRange(userId, dto.from, dto.to);
      
      const mapped = await Promise.all(events.map(async (e) => {
        let buddyInfo = undefined;

        if (e.type === CalendarEventType.SESSION && e.sessionId) {
          const session = await this.sessionRepo.findById(e.sessionId);
          if (session) {
            const connection = await this.connectionRepo.findById(session.buddyConnectionId);
            if (connection) {
              const buddyId = connection.userId === userId ? connection.buddyId : connection.userId;
              const buddyUser = await this.userRepo.findById(buddyId);
              if (buddyUser) {
                buddyInfo = {
                  userId:   buddyUser.id,
                  fullName: buddyUser.fullName,
                };
              }
            }
          }
        }

        return CalendarMapper.eventToResponse(e, undefined, undefined, buddyInfo);
      }));
      
      return { events: mapped };
    } catch (err) {
      logger.error('[GetCalendarEventsUsecase] Error:', { error: err });
      throw err;
    }
  }
}
