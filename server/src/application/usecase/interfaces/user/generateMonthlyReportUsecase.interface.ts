export interface IGenerateMonthlyReportUsecase {
  execute(userId: string, month: number, year: number): Promise<any>;
}
