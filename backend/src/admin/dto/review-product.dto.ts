import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RejectProductDto {
  @IsString()
  @IsNotEmpty({ message: '거절 사유를 입력해주세요' })
  reason: string;
}
