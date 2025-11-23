import { IsString, IsNotEmpty, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';

export class AddProductImageDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsInt()
  @Min(1)
  width: number;

  @IsInt()
  @Min(1)
  height: number;

  @IsInt()
  @Min(1)
  size: number;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}
