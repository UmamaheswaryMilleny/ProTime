import { inject, injectable } from 'tsyringe';
import type { IProposeRecurringSessionUsecase } from '../../interface/calendar/propose-recurring-session.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { ProposeRecurringSessionRequestDTO } from '../../../dto/calendar/request/propose-recurring-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

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

    // Calculate dates
    const recurringDates = this.calculateRecurringDates(dto);

    // Calculate duration in minutes
    const startParts = dto.startTime.split(':').map(Number);
    const endParts = dto.endTime.split(':').map(Number);
    const startH = startParts[0] || 0;
    const startM = startParts[1] || 0;
    const endH = endParts[0] || 0;
    const endM = endParts[1] || 0;

    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // handles overnight if end < start
    if (durationMinutes === 0) durationMinutes = 60; // fallback default if same

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const request = await this.scheduleRequestRepo.save({
      // We are creating a recurring request, don't set sessionId
      proposedBy:     userId,
      proposedTo:     participantId,
      scheduledAt:    recurringDates[0], // primary date for legacy compatibility
      recurringDates,
      durationMinutes,
      confirmStatus: ScheduleConfirmStatus.PENDING,
      expiresAt,
    });

    const proposer = await this.userRepo.findById(userId);
    const response = CalendarMapper.scheduleRequestToResponse(
      request,
      proposer?.fullName ?? 'Unknown',
    );

    this.socketService.emitToUser(participantId, 'schedule:proposed', response);

    return response;
  }

  private calculateRecurringDates(dto: ProposeRecurringSessionRequestDTO): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date();
    const targetDays = dto.days.map(day => DAYS_OF_WEEK.indexOf(day));
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
