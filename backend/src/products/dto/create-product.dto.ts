import {
  IsString,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsBoolean()
  is_primary: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

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
  @Transform(({ value }) => value === '' ? null : value)
  brand_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
