import { inject, injectable } from 'tsyringe';
import type { IProposeNextSessionUsecase } from '../../interface/calendar/propose-next-session.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IBuddySessionRepository } from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { ProposeNextSessionRequestDTO } from '../../../dto/calendar/request/propose-next-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
// import { SessionNotFoundError, NotInActiveSessionError } from '../../../../domain/errors/calendar.errors';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

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
      sessionId:      dto.sessionId,
      proposedBy:     userId,
      proposedTo:     participantId,
      scheduledAt,
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
}
