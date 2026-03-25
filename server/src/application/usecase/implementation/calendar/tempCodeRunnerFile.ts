import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import type { IRespondToScheduleRequestUsecase } from '../../interface/calendar/respond-to-schedule-request.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IBuddySessionRepository } from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { ICalendarEventRepository } from '../../../../domain/repositories/calendar/calendar-event.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
import type { RespondToScheduleRequestDTO } from '../../../dto/calendar/request/respond-to-schedule-request.request.dto';
import {
  SessionNotFoundError,
  ScheduleRequestNotFoundError,
  UnauthorizedSessionActionError,
  ScheduleRequestAlreadyRespondedError,
} from '../../../../domain/errors/calendar.error';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { SessionStatus, CalendarEventType, ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

@injectable()
export class RespondToScheduleRequestUsecase implements IRespondToScheduleRequestUsecase {
  constructor(
    @inject('ISessionScheduleRequestRepository')
    private readonly scheduleRequestRepo: ISessionScheduleRequestRepository,

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
    userId:    string,
    requestId: string,
    dto:       RespondToScheduleRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO> {
    const { status } = dto;
    const request = await this.scheduleRequestRepo.findById(requestId);
    if (!request) throw new ScheduleRequestNotFoundError();

    const respondedAt = new Date();

    if (status === ScheduleConfirmStatus.REJECTED) {
      const updated = await this.scheduleRequestRepo.updateConfirmStatus(
        requestId,
        ScheduleConfirmStatus.REJECTED,
        respondedAt,
      );

      const proposer = await this.userRepo.findById(request.proposedBy);
      const response = CalendarMapper.scheduleRequestToResponse(
        updated ?? request,
        proposer?.fullName ?? 'Unknown',
      );

      this.socketService.emitToUser(request.proposedBy, 'schedule:rejected', response);
      return response;
    }

    // CONFIRM
    const updated = await this.scheduleRequestRepo.updateConfirmStatus(
      requestId,
      ScheduleConfirmStatus.CONFIRMED,
      respondedAt,
    );

    let conversationId = '';
    let buddyConnectionId = '';

    if (request.sessionId) {
      const originalSession = await this.sessionRepo.findById(request.sessionId);
      if (!originalSession) throw new SessionNotFoundError();
      conversationId = originalSession.conversationId ?? '';
      buddyConnectionId = originalSession.buddyConnectionId ?? '';
    } else {
      const convs = await this.conversationRepo.findByUserId(request.proposedBy);
      const conv = convs.find(c => c.user1Id === request.proposedTo || c.user2Id === request.proposedTo);
      if (!conv) throw new ConversationNotFoundError();
      conversationId = conv.id as string;
      buddyConnectionId = conv.buddyConnectionId as string;
    }

    // Fetch user names for calendar event titles
    const [proposerUser, proposedToUser] = await Promise.all([
      this.userRepo.findById(request.proposedBy),
      this.userRepo.findById(request.proposedTo),
    ]);

    const datesToSchedule = request.recurringDates && request.recurringDates.length > 0
      ? request.recurringDates
      : [request.scheduledAt];

    for (const d of datesToSchedule) {
      const newSession = await this.sessionRepo.save({
        conversationId:    conversationId as string,
        buddyConnectionId: buddyConnectionId as string,
        initiatorId:       request.proposedBy,
        participantId:     request.proposedTo,
        status:            SessionStatus.PLANNED,
        scheduledAt:       d,
        roomId:            randomUUID(),
      });

      const dateStr      = d.toISOString().split('T')[0];
      const startTimeStr = d.toTimeString().slice(0, 5);

      await Promise.all([
        this.calendarRepo.save({
          userId:    request.proposedBy,
          type:      CalendarEventType.SESSION,
          date:      dateStr,
          startTime: startTimeStr,
          title:     `Session with ${proposedToUser?.fullName ?? 'Buddy'}`,
          sessionId: newSession.id,
        }),
        this.calendarRepo.save({
          userId:    request.proposedTo,
          type:      CalendarEventType.SESSION,
          date:      dateStr,
          startTime: startTimeStr,
          title:     `Session with ${proposerUser?.fullName ?? 'Buddy'}`,
          sessionId: newSession.id,
        }),
      ]);
    }

    const response = CalendarMapper.scheduleRequestToResponse(
      updated ?? request,
      proposerUser?.fullName ?? 'Unknown',
    );

    this.socketService.emitToUser(request.proposedBy, 'schedule:confirmed', response);
    
    // Dispatch the notification for schedule acceptance
    this.socketService.emitToUser(request.proposedBy, 'notification:schedule_accepted', {
      type: 'schedule_accepted',
      message: `${proposedToUser?.fullName ?? 'Your buddy'} accepted your session schedule request!`
    });

    return response;
  }
}
