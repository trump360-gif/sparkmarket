import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: string, productId: string) {
    // 상품 존재 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // 기존 찜 여부 확인
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (existingFavorite) {
      // 찜 취소
      await this.prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return { isFavorited: false };
    } else {
      // 찜 추가
      await this.prisma.favorite.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
      });
      return { isFavorited: true };
    }
  }

  async checkFavorite(userId: string | null, productId: string) {
    if (!userId) {
      return { isFavorited: false };
    }

    const favorite = await this.prisma.favorite.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    return { isFavorited: !!favorite };
  }

  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { user_id: userId },
        include: {
          product: {
            include: {
              images: {
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
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({
        where: { user_id: userId },
      }),
    ]);

    // favorite 객체에서 product만 추출
    const products = favorites.map((favorite) => favorite.product);

    return {
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
