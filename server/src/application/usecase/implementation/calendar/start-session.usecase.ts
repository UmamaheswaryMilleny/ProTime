import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import type { IStartSessionUsecase }        from '../../interface/calendar/start-session.usecase.interface';
import type { IBuddySessionRepository }     from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { ICalendarEventRepository }    from '../../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { IConversationRepository }     from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IUserRepository }             from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService }              from '../../../service_interface/socket-service.interface';
import type { BuddySessionResponseDTO }     from '../../../dto/calendar/response/buddy-session.response.dto';
import {
  BuddySessionAlreadyActiveError,
  UnauthorizedSessionActionError,
} from '../../../../domain/errors/calendar.error';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { SessionStatus, CalendarEventType } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

@injectable()
export class StartSessionUsecase implements IStartSessionUsecase {
  constructor(
    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,

    @inject('ICalendarEventRepository')
    private readonly calendarRepo: ICalendarEventRepository,

    @inject('IConversationRepository')
    private readonly conversationRepo: IConversationRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,

    @inject('ISocketService')
    private readonly socketService: ISocketService,
  ) {}

  async execute(
    initiatorId:    string,
    conversationId: string,
  ): Promise<BuddySessionResponseDTO> {

    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new ConversationNotFoundError();

    const isParticipant =
      conversation.user1Id === initiatorId ||
      conversation.user2Id === initiatorId;
    if (!isParticipant) throw new UnauthorizedSessionActionError();

    const existing = await this.sessionRepo.findActiveByConversationId(conversationId);
    if (existing) throw new BuddySessionAlreadyActiveError();

    const participantId = conversation.user1Id === initiatorId
      ? conversation.user2Id
      : conversation.user1Id;

    // Fetch both users for calendar event titles
    const [initiator, participant] = await Promise.all([
      this.userRepo.findById(initiatorId),
      this.userRepo.findById(participantId),
    ]);

    const initiatorName  = initiator?.fullName   ?? 'Buddy';
    const participantName = participant?.fullName ?? 'Buddy';

    const startedAt = new Date();
    const date      = startedAt.toISOString().split('T')[0];
    const startTime = startedAt.toTimeString().slice(0, 5);

    // Look for the earliest upcoming PLANNED session for this conversation
    const conversationSessions = await this.sessionRepo.findByConversationId(conversationId);
    const planned = conversationSessions
      .filter(s => s.status === SessionStatus.PLANNED)
      .sort((a, b) => {
        const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return timeA - timeB;
      })[0];

    let session;
    if (planned) {
      // Transition existing planned session to ACTIVE
      const updated = await this.sessionRepo.updateStatus(planned.id!, SessionStatus.ACTIVE, {
        startedAt,
      });
      if (!updated) {
        throw new Error('Failed to activate planned study session');
      }
      session = updated;
    } else {
      // Ad-hoc session creation
      session = await this.sessionRepo.save({
        conversationId,
        buddyConnectionId: conversation.buddyConnectionId,
        initiatorId,
        participantId,
        status:    SessionStatus.ACTIVE,
        startedAt,
        roomId:            randomUUID(),
      });

      // Each user sees the OTHER person's name as title for ad-hoc sessions
      await Promise.all([
        this.calendarRepo.save({
          userId:    initiatorId,
          type:      CalendarEventType.SESSION,
          date,
          startTime,
          title:     `Session with ${participantName}`,
          sessionId: session.id,
        }),
        this.calendarRepo.save({
          userId:    participantId,
          type:      CalendarEventType.SESSION,
          date,
          startTime,
          title:     `Session with ${initiatorName}`,
          sessionId: session.id,
        }),
      ]);
    }

    const response = CalendarMapper.sessionToResponse(session);

    this.socketService.emitToUser(initiatorId,   'session:started', response);
    this.socketService.emitToUser(participantId, 'session:started', response);

    return response;
  }
}
