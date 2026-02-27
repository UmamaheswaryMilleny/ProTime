import { inject, injectable } from "tsyringe";

@injectable()
export class GenerateMonthlyReportUsecase
  implements IGenerateMonthlyReportUsecase
{
  constructor(
    @inject("IReportRepository")
    private readonly reportRepository: IReportRepository
  ) {}

  async execute(userId: string, month: number, year: number) {
    return this.reportRepository.generate(userId, month, year);
  }
}
