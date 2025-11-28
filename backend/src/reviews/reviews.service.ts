import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { transaction_id, rating, content, review_type } = createReviewDto;

    // 거래 확인
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transaction_id },
    });

    if (!transaction) {
      throw new NotFoundException('거래를 찾을 수 없습니다');
    }

    if (transaction.status !== 'COMPLETED') {
      throw new ForbiddenException('완료된 거래에만 리뷰를 작성할 수 있습니다');
    }

    // 리뷰 작성 권한 확인
    let reviewee_id: string;

    if (review_type === 'BUYER_TO_SELLER') {
      // 구매자가 판매자에게 리뷰
      if (transaction.buyer_id !== userId) {
        throw new ForbiddenException('이 거래의 구매자만 리뷰를 작성할 수 있습니다');
      }
      reviewee_id = transaction.seller_id;
    } else {
      // 판매자가 구매자에게 리뷰
      if (transaction.seller_id !== userId) {
        throw new ForbiddenException('이 거래의 판매자만 리뷰를 작성할 수 있습니다');
      }
      reviewee_id = transaction.buyer_id;
    }

    // 중복 리뷰 확인
    const existingReview = await this.prisma.review.findFirst({
      where: {
        transaction_id,
        reviewer_id: userId,
        review_type,
      },
    });

    if (existingReview) {
      throw new ConflictException('이미 이 거래에 대한 리뷰를 작성했습니다');
    }

    // 리뷰 작성자 정보 조회
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true },
    });

    const review = await this.prisma.review.create({
      data: {
        transaction_id,
        reviewer_id: userId,
        reviewee_id,
        rating,
        content,
        review_type,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
      },
    });

    // 리뷰 대상자에게 알림 전송
    await this.notificationsService.notifyReviewReceived(
      reviewee_id,
      reviewer?.nickname || '알 수 없음',
      rating,
    );

    return review;
  }

  async findByTransaction(transactionId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { transaction_id: transactionId },
      include: {
        reviewer: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
      },
    });

    return reviews;
  }

  async getMyReviews(userId: string, type: 'written' | 'received', page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = type === 'written' ? { reviewer_id: userId } : { reviewee_id: userId };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async canWriteReview(userId: string, transactionId: string, reviewType: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.status !== 'COMPLETED') {
      return { canWrite: false, reason: '완료된 거래가 아닙니다' };
    }

    // 권한 확인
    if (reviewType === 'BUYER_TO_SELLER' && transaction.buyer_id !== userId) {
      return { canWrite: false, reason: '이 거래의 구매자가 아닙니다' };
    }
    if (reviewType === 'SELLER_TO_BUYER' && transaction.seller_id !== userId) {
      return { canWrite: false, reason: '이 거래의 판매자가 아닙니다' };
    }

    // 이미 작성한 리뷰 확인
    const existingReview = await this.prisma.review.findFirst({
      where: {
        transaction_id: transactionId,
        reviewer_id: userId,
        review_type: reviewType,
      },
    });

    if (existingReview) {
      return { canWrite: false, reason: '이미 리뷰를 작성했습니다', existingReview };
    }

    return { canWrite: true };
  }
}
