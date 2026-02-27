export interface IExportReportUsecase {
  execute(userId: string, month: number, year: number): Promise<Buffer>;
}
