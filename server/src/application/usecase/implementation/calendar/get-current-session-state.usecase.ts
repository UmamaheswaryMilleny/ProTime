import { inject, injectable } from 'tsyringe';
import type { IGetCurrentSessionStateUsecase, CurrentSessionStateResponseDTO } from '../../interface/calendar/get-current-session-state.usecase.interface';
import type { IBuddySessionRepository } from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import { SessionStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

@injectable()
export class GetCurrentSessionStateUsecase implements IGetCurrentSessionStateUsecase {
  constructor(
    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,
  ) {}

  async execute(conversationId: string): Promise<CurrentSessionStateResponseDTO> {
    const sessions = await this.sessionRepo.findByConversationId(conversationId);

    const active = sessions.find(s => s.status === SessionStatus.ACTIVE) || null;
    const planned = sessions
      .filter(s => s.status === SessionStatus.PLANNED)
      .sort((a, b) => {
        const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return timeA - timeB;
      })[0] || null;

    return {
      active: active ? CalendarMapper.sessionToResponse(active) : null,
      planned: planned ? CalendarMapper.sessionToResponse(planned) : null,
    };
  }
}
