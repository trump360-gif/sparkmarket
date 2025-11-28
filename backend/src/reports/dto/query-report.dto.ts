import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export class QueryReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsString()
  @IsOptional()
  target_type?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
