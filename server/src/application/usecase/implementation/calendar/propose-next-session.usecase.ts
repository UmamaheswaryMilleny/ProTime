import { inject, injectable } from 'tsyringe';
import type { IProposeNextSessionUsecase } from '../../interface/calendar/propose-next-session.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IBuddySessionRepository } from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import type { ProposeNextSessionRequestDTO } from '../../../dto/calendar/request/propose-next-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
// import { SessionNotFoundError, NotInActiveSessionError } from '../../../../domain/errors/calendar.errors';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class ProposeNextSessionUsecase implements IProposeNextSessionUsecase {
  constructor(
    @inject('ISessionScheduleRequestRepository')
    private readonly scheduleRequestRepo: ISessionScheduleRequestRepository,

    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,

    @inject('IConversationRepository')
    private readonly conversationRepo: IConversationRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,

    @inject('ISocketService')
    private readonly socketService: ISocketService,

    @inject('INotificationService')
    private readonly notificationService: INotificationService,

    @inject('IDirectMessageRepository')
    private readonly messageRepo: IDirectMessageRepository,
  ) {}

  async execute(
    userId:         string,
    conversationId: string,
    dto:            ProposeNextSessionRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new ConversationNotFoundError();

    const participantId = conversation.user1Id === userId
      ? conversation.user2Id
      : conversation.user1Id;

    const scheduledAt = new Date(dto.scheduledAt);
    const expiresAt   = new Date(Date.now() + 24 * 60 * 60 * 1000); // ← fixed

    const request = await this.scheduleRequestRepo.save({
     sessionId:       dto.sessionId,
      proposedBy:      userId,
      proposedTo:      participantId,
      scheduledAt,
      recurringDates:  [],    // ← single session — no recurring dates
      durationMinutes: 0,     // ← not applicable for single session proposal
      confirmStatus:   ScheduleConfirmStatus.PENDING,
      expiresAt,
    });

    const proposer = await this.userRepo.findById(userId);
    const proposerName = proposer?.fullName ?? 'A Buddy';

    const response = CalendarMapper.scheduleRequestToResponse(
      request,
      proposerName,
    );

    this.socketService.emitToUser(participantId, 'schedule:proposed', response);

    // Save and broadcast system message to chat
    const systemMessage = await this.messageRepo.save({
      conversationId,
      senderId: null,
      content: `${proposerName} proposed a new study session`,
      messageType: MessageType.SYSTEM,
      status: MessageStatus.DELIVERED,
    });

    await this.conversationRepo.updateLastMessage(
      conversationId,
      systemMessage.createdAt,
      null as any,
    );

    const msgResponse = ChatMapper.messageToResponse(systemMessage, null);
    this.socketService.emitToUser(userId, 'chat:message', msgResponse);
    this.socketService.emitToUser(participantId, 'chat:message', msgResponse);

    // Also send in-app notification for the bell icon
    try {
      this.notificationService.notifyUser(participantId, {
        type: NotificationType.SCHEDULE_REQUESTED,
        title: '📅 New Study Schedule Request',
        message: `${proposerName} proposed a study session.`,
        metadata: { requestId: request.id, conversationId }
      });
    } catch (err: unknown) {
      // Ignore notification delivery failures
    }

    return response;
  }
}
