import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from './query-report.dto';

export class UpdateReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsString()
  @IsOptional()
  admin_note?: string;
}
