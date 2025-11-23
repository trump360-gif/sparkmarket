import { IsString, IsNotEmpty, IsInt, Min, IsIn } from 'class-validator';

export class UploadPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
  contentType: string;

  @IsInt()
  @Min(1)
  fileSize: number;
}
