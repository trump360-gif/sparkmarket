import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
        bio: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async getProfile(id: string) {
    const user = await this.findById(id);

    // 받은 리뷰 통계 계산
    const reviewStats = await this.prisma.review.aggregate({
      where: { reviewee_id: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 판매 통계
    const salesCount = await this.prisma.transaction.count({
      where: { seller_id: id, status: 'COMPLETED' },
    });

    // 구매 통계
    const purchaseCount = await this.prisma.transaction.count({
      where: { buyer_id: id, status: 'COMPLETED' },
    });

    // 판매중인 상품 수
    const activeProductsCount = await this.prisma.product.count({
      where: { seller_id: id, status: 'FOR_SALE' },
    });

    return {
      ...user,
      stats: {
        rating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count.rating,
        salesCount,
        purchaseCount,
        activeProductsCount,
      },
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // 닉네임 중복 체크
    if (updateProfileDto.nickname) {
      const existing = await this.prisma.user.findFirst({
        where: {
          nickname: updateProfileDto.nickname,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
        bio: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }

  async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewee_id: userId },
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
        },
      }),
      this.prisma.review.count({ where: { reviewee_id: userId } }),
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

  async getMyTransactions(userId: string, type: 'all' | 'sold' | 'bought' = 'all', page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const whereClause = type === 'all'
      ? { OR: [{ seller_id: userId }, { buyer_id: userId }] }
      : type === 'sold'
        ? { seller_id: userId }
        : { buyer_id: userId };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { ...whereClause, status: 'COMPLETED' },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
          buyer: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
          reviews: {
            select: {
              id: true,
              review_type: true,
              reviewer_id: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({
        where: { ...whereClause, status: 'COMPLETED' },
      }),
    ]);

    // 각 거래에 대해 현재 사용자가 리뷰를 작성할 수 있는지 확인
    const transactionsWithReviewStatus = transactions.map((tx) => {
      const isSeller = tx.seller_id === userId;
      const reviewType = isSeller ? 'SELLER_TO_BUYER' : 'BUYER_TO_SELLER';
      const hasWrittenReview = tx.reviews.some(
        (r) => r.reviewer_id === userId && r.review_type === reviewType,
      );

      return {
        ...tx,
        canWriteReview: !hasWrittenReview,
        myRole: isSeller ? 'seller' : 'buyer',
        reviewType,
      };
    });

    return {
      data: transactionsWithReviewStatus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
