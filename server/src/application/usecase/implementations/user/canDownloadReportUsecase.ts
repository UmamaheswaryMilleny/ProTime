@injectable()
export class CanDownloadReportUsecase {
  async execute(userId: string): Promise<boolean> {
    return false;
  }
}
