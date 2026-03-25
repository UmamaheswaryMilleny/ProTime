import type { RespondToScheduleRequestDTO }       from '../../../dto/calendar/request/respond-to-schedule-request.request.dto';
import type { SessionScheduleRequestResponseDTO }  from '../../../dto/calendar/response/session-schedule-request.response.dto';

export interface IRespondToScheduleRequestUsecase {
  execute(
    userId:    string,
    requestId: string,
    dto:       RespondToScheduleRequestDTO,
  ): Promise<SessionScheduleRequestResponseDTO>;
}
