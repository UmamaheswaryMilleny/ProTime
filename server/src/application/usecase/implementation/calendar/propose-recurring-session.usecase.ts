import { inject, injectable } from 'tsyringe';
import type { IProposeRecurringSessionUsecase } from '../../interface/calendar/propose-recurring-session.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import type { ProposeRecurringSessionRequestDTO } from '../../../dto/calendar/request/propose-recurring-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';
import { ChatMapper } from '../../../mapper/chat.mapper';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@injectable()
export class ProposeRecurringSessionUsecase implements IProposeRecurringSessionUsecase {
  constructor(
    @inject('ISessionScheduleRequestRepository')
    private readonly scheduleRequestRepo: ISessionScheduleRequestRepository,

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
    dto:            ProposeRecurringSessionRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new ConversationNotFoundError();

    const participantId = conversation.user1Id === userId
      ? conversation.user2Id
      : conversation.user1Id;

    // Calculate duration — support overnight sessions (crosses midnight)
    const [startH = 0, startM = 0] = dto.startTime.split(':').map(Number);
    const [endH = 0, endM = 0]     = dto.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes   = endH   * 60 + endM;
    
    let durationMinutes = endMinutes - startMinutes;
    if (endMinutes < startMinutes) {
      // Overnight session crossing midnight
      durationMinutes = (24 * 60 - startMinutes) + endMinutes;
    }

    if (durationMinutes < 30) {
      throw new Error('Session duration must be at least 30 minutes');
    }
    if (durationMinutes > 720) {
      throw new Error('Session duration cannot exceed 12 hours');
    }

    let recurringDates: Date[] = [];

    if (dto.dates && dto.dates.length > 0) {
      recurringDates = dto.dates.map((ds) => {
        const d = new Date(`${ds}T00:00:00`); // Parse as local-like
        d.setHours(startH, startM, 0, 0);
        return d;
      });
    } else {
      recurringDates = this.calculateRecurringDates(dto);
    }

    // ─── New Validation: No sessions in the past ────────────────────
    const firstDate = recurringDates[0];
    if (!firstDate) {
        throw new Error('No valid dates found for this schedule');
    }
    if (firstDate.getTime() <= Date.now()) {
        throw new Error('Cannot schedule a session that has already passed today');
    }
    // ────────────────────────────────────────────────────────────────

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const request = await this.scheduleRequestRepo.save({
      // We are creating a recurring request, don't set sessionId
      proposedBy:     userId,
      proposedTo:     participantId,
      scheduledAt:    firstDate, // primary date for legacy compatibility
      recurringDates,
      durationMinutes,
      confirmStatus: ScheduleConfirmStatus.PENDING,
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
      content: `${proposerName} proposed a recurring study schedule (${dto.noOfSessions} sessions)`,
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
    this.notificationService.notifyUser(participantId, {
      type: NotificationType.SCHEDULE_REQUESTED,
      title: '📅 New Study Schedule Request',
      message: `${proposerName} proposed a ${dto.noOfSessions}-session study schedule.`,
      metadata: { requestId: request.id, conversationId }
    });

    return response;
  }

  private calculateRecurringDates(dto: ProposeRecurringSessionRequestDTO): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date();
    const targetDays = dto.days
      .map(day => DAYS_OF_WEEK.findIndex(d => d.toLowerCase() === day.toLowerCase()))
      .filter(idx => idx !== -1);

    if (targetDays.length === 0) {
      throw new Error('No valid study days provided (e.g. Monday, Tuesday)');
    }
    const timeParts = dto.startTime.split(':').map(Number);
    const hour = timeParts[0] || 0;
    const min = timeParts[1] || 0;

    // Set time on current date
    currentDate.setHours(hour, min, 0, 0);

    // If target time today has passed, start looking from tomorrow
    if (currentDate.getTime() <= Date.now() && targetDays.includes(currentDate.getDay())) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (dates.length < dto.noOfSessions) {
      if (targetDays.includes(currentDate.getDay())) {
        if (currentDate.getTime() > Date.now()) {
          dates.push(new Date(currentDate));
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}
