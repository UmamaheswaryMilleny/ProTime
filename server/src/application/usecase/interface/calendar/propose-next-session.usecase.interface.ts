import type { ProposeNextSessionRequestDTO }     from '../../../dto/calendar/request/propose-next-session.request.dto';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';

export interface IProposeNextSessionUsecase {
  execute(
    userId:         string,
    conversationId: string,
    dto:            ProposeNextSessionRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO>;
}
