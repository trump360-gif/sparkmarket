import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ReportReason {
  SPAM = 'SPAM',
  FRAUD = 'FRAUD',
  INAPPROPRIATE = 'INAPPROPRIATE',
  PROHIBITED_ITEM = 'PROHIBITED_ITEM',
  FAKE = 'FAKE',
  OTHER = 'OTHER',
}

export enum ReportTargetType {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
}

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  @IsNotEmpty()
  target_type: ReportTargetType;

  @IsString()
  @IsNotEmpty()
  target_id: string;

  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @IsString()
  @IsOptional()
  description?: string;
}
