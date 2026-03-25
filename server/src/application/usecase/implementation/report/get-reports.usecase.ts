// src/application/usecase/implementation/report/get-reports.usecase.ts

import { inject, injectable } from 'tsyringe';
import type { IGetReportsUsecase }    from '../../interface/report/get-reports.usecase.interface';
import type { IReportRepository }     from '../../../../domain/repositories/report/report.repository.interface';
import type { GetReportsRequestDTO }  from '../../../dto/report/request/get-reports.request.dto';
import type { GetReportsResponseDTO } from '../../../dto/report/response/get-reports.response.dto';
import { ReportMapper } from '../../../mapper/report.mapper';

@injectable()
export class GetReportsUsecase implements IGetReportsUsecase {
  constructor(
    @inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(dto: GetReportsRequestDTO): Promise<GetReportsResponseDTO> {
    const { reports, total } = await this.reportRepo.findAll({
      status:         dto.status,
      reportedUserId: dto.reportedUserId, // ← this line was missing
      page:           dto.page,
      limit:          dto.limit,
    });

    return {
      reports: reports.map(ReportMapper.toResponse),
      total,
      page:    dto.page,
      limit:   dto.limit,
    };
  }
}