import { IsString, IsInt, IsOptional, Min, Max, MaxLength, IsIn } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  transaction_id: string;

  @IsInt()
  @Min(1, { message: '별점은 1점 이상이어야 합니다' })
  @Max(5, { message: '별점은 5점 이하여야 합니다' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '리뷰는 500자 이하여야 합니다' })
  content?: string;

  @IsString()
  @IsIn(['BUYER_TO_SELLER', 'SELLER_TO_BUYER'], {
    message: '올바른 리뷰 타입을 선택해주세요',
  })
  review_type: string;
}
