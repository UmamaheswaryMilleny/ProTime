import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ReportContext, ReportReason } from '../../../../domain/enums/report.enums';

export class SubmitReportRequestDTO {
  @IsString()
  @IsNotEmpty()
  reportedUserId!: string;

  @IsEnum(ReportContext)
  context!: ReportContext;

  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  additionalDetails?: string;
}