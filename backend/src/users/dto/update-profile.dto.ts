import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 20자 이하여야 합니다' })
  @Matches(/^[가-힣a-zA-Z0-9_]+$/, {
    message: '닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다',
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '자기소개는 200자 이하여야 합니다' })
  bio?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
