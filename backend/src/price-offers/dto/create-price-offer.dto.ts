import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePriceOfferDto {
  @IsInt()
  @Min(1, { message: '제안 가격은 1원 이상이어야 합니다.' })
  offered_price: number;

  @IsOptional()
  @IsString()
  message?: string;
}
