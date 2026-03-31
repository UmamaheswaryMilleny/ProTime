import { inject, injectable } from 'tsyringe';
import type { IGetDayDetailUsecase }   from '../../interface/calendar/get-day-detail.usecase.interface';
import type { ICalendarEventRepository } from '../../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { IBuddySessionRepository }  from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { ISessionNoteRepository } from '../../../../domain/repositories/calendar/session-not.repository.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { GetDayDetailResponseDTO }  from '../../../dto/calendar/response/get-day-detail.response.dto';
import { CalendarMapper } from '../../../mapper/calendar.mapper';
import { CalendarEventType } from '../../../../domain/enums/calendar.enums';
import { logger } from '../../../../infrastructure/config/logger.config';

@injectable()
export class GetDayDetailUsecase implements IGetDayDetailUsecase {
  constructor(
    @inject('ICalendarEventRepository')
    private readonly eventRepo: ICalendarEventRepository,

    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,

    @inject('ISessionNoteRepository')
    private readonly noteRepo: ISessionNoteRepository,

    @inject('IBuddyConnectionRepository')
    private readonly connectionRepo: IBuddyConnectionRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string, date: string): Promise<GetDayDetailResponseDTO> {
    try {
      // Find all events for the day (TASK/SESSION)
      const events = await this.eventRepo.findByUserIdAndDateRange(userId, date, date);

      const mappedEvents = await Promise.all(
        events.map(async (event) => {
          let sessionDTO = undefined;
          let noteDTO = undefined;
          let buddyInfo  = undefined;

          if (event.type === CalendarEventType.SESSION && event.sessionId) {
            const [session, note] = await Promise.all([
              this.sessionRepo.findById(event.sessionId),
              this.noteRepo.findBySessionAndUser(event.sessionId, userId),
            ]);

            if (session) {
              sessionDTO = CalendarMapper.sessionToResponse(session);
              
              // Fetch buddy name
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
            if (note) {
              noteDTO = CalendarMapper.noteToResponse(note);
            }
          }

          return CalendarMapper.eventToResponse(event, sessionDTO, noteDTO, buddyInfo);
        }),
      );

      return {
        date,
        events: mappedEvents,
      };
    } catch (err) {
      logger.error('[GetDayDetailUsecase] Error:', { error: err });
      throw err;
    }
  }
}
