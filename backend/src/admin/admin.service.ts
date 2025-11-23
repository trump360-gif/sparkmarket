import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 대시보드 통계
  async getDashboardStats() {
    const [totalUsers, totalProducts, totalSoldProducts, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'SOLD_OUT' } }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);

    // 최근 7일간 등록된 상품 수
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProducts = await this.prisma.product.count({
      where: {
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    // 최근 7일간 가입한 유저 수
    const recentUsers = await this.prisma.user.count({
      where: {
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      totalProducts,
      totalSoldProducts,
      activeUsers,
      recentProducts,
      recentUsers,
    };
  }

  // 전체 상품 관리 (관리자용)
  async getAllProducts(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              nickname: true,
              status: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 관리자용 상품 삭제
  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: '상품이 삭제되었습니다' };
  }

  // 전체 유저 관리
  async getAllUsers(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar_url: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 유저 상태 변경 (활성/차단)
  async updateUserStatus(userId: string, status: string) {
    if (!['ACTIVE', 'BANNED'].includes(status)) {
      throw new BadRequestException('잘못된 상태값입니다. ACTIVE 또는 BANNED만 가능합니다');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    // 관리자 계정은 차단할 수 없음
    if (user.role === 'ADMIN') {
      throw new BadRequestException('관리자 계정은 상태를 변경할 수 없습니다');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }

  // 최근 상품 목록 (대시보드용)
  async getRecentProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        images: {
          where: { is_primary: true },
          take: 1,
        },
      },
    });

    return products;
  }
}
