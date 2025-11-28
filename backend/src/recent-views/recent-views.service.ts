import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecentViewsService {
  constructor(private prisma: PrismaService) {}

  async addView(userId: string, productId: string) {
    // 기존 조회 기록 확인
    const existingView = await this.prisma.recentView.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (existingView) {
      // 이미 있으면 viewed_at 업데이트
      await this.prisma.recentView.update({
        where: {
          id: existingView.id,
        },
        data: {
          viewed_at: new Date(),
        },
      });
    } else {
      // 없으면 새로 생성
      await this.prisma.recentView.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
      });
    }
  }

  async getRecentViews(userId: string, limit: number = 50) {
    const recentViews = await this.prisma.recentView.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
              orderBy: { order: 'asc' },
            },
            seller: {
              select: {
                id: true,
                nickname: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: { viewed_at: 'desc' },
      take: limit,
    });

    // product가 삭제된 경우를 필터링
    const products = recentViews
      .filter((view) => view.product !== null)
      .map((view) => ({
        ...view.product,
        viewed_at: view.viewed_at,
      }));

    return {
      data: products,
      total: products.length,
    };
  }

  async deleteAll(userId: string) {
    await this.prisma.recentView.deleteMany({
      where: { user_id: userId },
    });

    return { message: '최근 본 상품 기록이 모두 삭제되었습니다' };
  }

  async deleteOne(userId: string, productId: string) {
    const view = await this.prisma.recentView.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (view) {
      await this.prisma.recentView.delete({
        where: { id: view.id },
      });
    }

    return { message: '최근 본 상품 기록이 삭제되었습니다' };
  }
}
