import type { ICanDownloadReportUsecase } from "../subscription/can-download-report.usecase.interface";

@injectable()
export class ExportReportUsecase {
  constructor(
    @inject("ICanDownloadReportUsecase")
    private readonly canDownload: ICanDownloadReportUsecase,

    @inject("IReportExporter")
    private readonly exporter: IReportExporter
  ) {}

  async execute(userId: string, month: number, year: number): Promise<Buffer> {
    const allowed = await this.canDownload.execute(userId);
    if (!allowed) {
      throw new Error("Premium subscription required");
    }

    return this.exporter.export(userId, month, year);
  }
}
