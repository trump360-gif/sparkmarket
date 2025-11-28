import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'BANNED'])
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
