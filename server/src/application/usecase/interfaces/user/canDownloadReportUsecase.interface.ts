export interface ICanDownloadReportUsecase {
  execute(userId: string): Promise<boolean>;
}
