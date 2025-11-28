import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // 리뷰 작성
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  // 내 리뷰 목록 (작성한/받은)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyReviews(
    @Request() req,
    @Query('type') type: 'written' | 'received' = 'received',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getMyReviews(req.user.id, type, +page, +limit);
  }

  // 리뷰 작성 가능 여부 확인
  @UseGuards(JwtAuthGuard)
  @Get('can-write')
  async canWriteReview(
    @Request() req,
    @Query('transactionId') transactionId: string,
    @Query('reviewType') reviewType: string,
  ) {
    return this.reviewsService.canWriteReview(req.user.id, transactionId, reviewType);
  }

  // 특정 거래의 리뷰 조회
  @Get('transaction/:transactionId')
  async getTransactionReviews(@Param('transactionId') transactionId: string) {
    return this.reviewsService.findByTransaction(transactionId);
  }
}
