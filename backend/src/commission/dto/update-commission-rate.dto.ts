import { IsNumber, Min, Max } from 'class-validator';

export class UpdateCommissionRateDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate: number;
}
