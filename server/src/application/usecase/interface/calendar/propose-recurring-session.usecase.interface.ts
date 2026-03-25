import type { ProposeRecurringSessionRequestDTO } from '../../../dto/calendar/request/propose-recurring-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';

export interface IProposeRecurringSessionUsecase {
  execute(
    userId: string,
    conversationId: string,
    dto: ProposeRecurringSessionRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO>;
}
