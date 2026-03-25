import type { GetReportsRequestDTO }  from '../../../dto/report/request/get-reports.request.dto';
import type { GetReportsResponseDTO } from '../../../dto/report/response/get-reports.response.dto';

export interface IGetReportsUsecase {
  execute(dto: GetReportsRequestDTO): Promise<GetReportsResponseDTO>;
}