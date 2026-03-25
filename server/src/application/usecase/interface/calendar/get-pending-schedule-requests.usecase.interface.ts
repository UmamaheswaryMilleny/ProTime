import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';

export interface IGetPendingScheduleRequestsUsecase {
  execute(userId: string): Promise<SessionScheduleRequestResponseDTO[]>;
}
