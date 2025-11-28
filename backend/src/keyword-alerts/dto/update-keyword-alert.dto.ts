import { IsString, IsOptional, IsNumber, MaxLength, Min } from 'class-validator';

export class UpdateKeywordAlertDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '키워드는 최대 50자까지 입력 가능합니다.' })
  keyword?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '최소 가격은 0원 이상이어야 합니다.' })
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '최대 가격은 0원 이상이어야 합니다.' })
  max_price?: number;
}
