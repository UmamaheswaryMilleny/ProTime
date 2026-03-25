import { inject, injectable } from 'tsyringe';
import type { IGetPendingScheduleRequestsUsecase } from '../../interface/calendar/get-pending-schedule-requests.usecase.interface';
import type { ISessionScheduleRequestRepository } from '../../../../domain/repositories/calendar/session-schedule-request.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { SessionScheduleRequestResponseDTO } from '../../../dto/calendar/response/session-schedule-request.response.dto';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

@injectable()
export class GetPendingScheduleRequestsUsecase implements IGetPendingScheduleRequestsUsecase {
  constructor(
    @inject('ISessionScheduleRequestRepository')
    private readonly requestRepo: ISessionScheduleRequestRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<SessionScheduleRequestResponseDTO[]> {
    try {
      const requests = await this.requestRepo.findPendingByUserId(userId);

      const mapped = await Promise.all(
        requests.map(async (request) => {
          const proposer = await this.userRepo.findById(request.proposedBy);
          return CalendarMapper.scheduleRequestToResponse(request, proposer?.fullName ?? 'Unknown');
        })
      );

      return mapped;
    } catch (err) {
      console.error('[GetPendingScheduleRequestsUsecase] Error:', err);
      throw err;
    }
  }
}
