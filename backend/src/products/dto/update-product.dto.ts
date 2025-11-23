import { IsString, IsInt, IsOptional, MaxLength, Min, IsEnum } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(['FOR_SALE', 'RESERVED', 'SOLD_OUT'])
  @IsOptional()
  status?: string;
}
