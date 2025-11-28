import { IsString, IsInt, IsOptional, MaxLength, Min, IsEnum, IsArray } from 'class-validator';

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

  @IsEnum(['FOR_SALE', 'SOLD', 'DELETED'])
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsEnum(['NEW', 'LIKE_NEW', 'USED', 'WELL_USED', 'FOR_PARTS'])
  condition?: string;

  @IsOptional()
  @IsEnum(['DIRECT', 'DELIVERY', 'BOTH'])
  trade_method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trade_location?: string;

  @IsOptional()
  @IsString()
  brand_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
