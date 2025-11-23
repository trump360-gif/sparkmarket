import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['ACTIVE', 'BANNED'])
  status: string;
}
