import { inject, injectable } from 'tsyringe';
import type { IEndSessionUsecase }          from '../../interface/calendar/end-session.usecase.interface';
import type { IBuddySessionRepository }     from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { ISocketService }              from '../../../service_interface/socket-service.interface';
import { CalendarMapper }              from '../../../mapper/calendar.mapper';
import type { BuddySessionResponseDTO }     from '../../../dto/calendar/response/buddy-session.response.dto';
import { SessionStatus }                    from '../../../../domain/enums/calendar.enums';

@injectable()
export class EndSessionUsecase implements IEndSessionUsecase {
  constructor(
    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,

    @inject('ISocketService')
    private readonly socket: ISocketService,
  ) {}

  async execute(userId: string, conversationId: string): Promise<BuddySessionResponseDTO> {
    try {
      const session = await this.sessionRepo.findActiveByConversationId(conversationId);

      if (!session) {
        throw new Error('No active session found for this conversation');
      }

      // Check if user is part of session
      if (session.initiatorId !== userId && session.participantId !== userId) {
        throw new Error('Unauthorized to end this session');
      }

      const now = new Date();
      const updated = await this.sessionRepo.updateStatus(session.id!, SessionStatus.COMPLETED, {
        endedAt: now,
      });

      if (!updated) {
        throw new Error('Failed to update session status');
      }

      const response = CalendarMapper.sessionToResponse(updated);

      // Notify participants via socket
      this.socket.emitToConversation(conversationId, 'session:ended', response);

      return response;
    } catch (err) {
      console.error('[EndSessionUsecase] Error:', err);
      throw err;
    }
  }
}
