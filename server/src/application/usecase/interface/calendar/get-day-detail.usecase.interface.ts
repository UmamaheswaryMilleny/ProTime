import type { GetDayDetailResponseDTO } from '../../../dto/calendar/response/get-day-detail.response.dto';

export interface IGetDayDetailUsecase {
  execute(
    userId: string,
    date:   string,  // YYYY-MM-DD
  ): Promise<GetDayDetailResponseDTO>;
}
