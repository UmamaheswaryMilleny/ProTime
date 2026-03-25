import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus, ReportAction } from '../../../../domain/enums/report.enums';

export class ResolveReportRequestDTO {
  @IsEnum(ReportStatus)
  status!: ReportStatus;  // RESOLVED or DISMISSED

  @IsOptional()
  @IsEnum(ReportAction)
  actionTaken?: ReportAction;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}