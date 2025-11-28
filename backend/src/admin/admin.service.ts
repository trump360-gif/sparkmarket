import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 대시보드 통계
  async getDashboardStats() {
    const [total_users, total_products, sold_products, active_products] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'SOLD' } }),
      this.prisma.product.count({ where: { status: 'FOR_SALE' } }),
    ]);

    // 오늘 자정부터 현재까지
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [new_products_today, new_users_today] = await Promise.all([
      this.prisma.product.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
    ]);

    // 오늘 판매된 상품의 금액 합계
    const soldToday = await this.prisma.product.aggregate({
      where: {
        status: 'SOLD',
        updated_at: {
          gte: today,
        },
      },
      _sum: {
        price: true,
      },
    });

    const today_sales = soldToday._sum.price || 0;

    // 최근 7일간 일별 판매 통계 (그래프용)
    const last7Days: Array<{ date: string; sales: number; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const soldOnDay = await this.prisma.product.aggregate({
        where: {
          status: 'SOLD',
          updated_at: {
            gte: date,
            lt: nextDate,
          },
        },
        _sum: {
          price: true,
        },
        _count: true,
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        sales: soldOnDay._sum.price || 0,
        count: soldOnDay._count,
      });
    }

    return {
      total_users,
      total_products,
      active_products,
      sold_products,
      new_users_today,
      new_products_today,
      today_sales,
      sales_chart: last7Days,
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

    return {
      success: true,
      user: updatedUser,
    };
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

  // 유저 상세 정보 조회
  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        status: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    // 상품 통계 집계
    const [total_products, active_products, sold_products] = await Promise.all([
      this.prisma.product.count({ where: { seller_id: userId } }),
      this.prisma.product.count({ where: { seller_id: userId, status: 'FOR_SALE' } }),
      this.prisma.product.count({ where: { seller_id: userId, status: 'SOLD' } }),
    ]);

    // 최근 상품 5개
    const recent_products = await this.prisma.product.findMany({
      where: { seller_id: userId },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        images: {
          where: { is_primary: true },
          take: 1,
        },
      },
    });

    return {
      ...user,
      product_stats: {
        total_products,
        active_products,
        sold_products,
      },
      recent_products,
    };
  }

  // 검토 대기 상품 목록 조회
  async getPendingReviewProducts(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: 'PENDING_REVIEW',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'asc' }, // 오래된 것 먼저
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              nickname: true,
              avatar_url: true,
            },
          },
          images: true,
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

  // 검토 대기 상품 상세 조회
  async getPendingReviewProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
            created_at: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    return product;
  }

  // 상품 검토 승인
  async approveProduct(productId: string, adminId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('검토 대기 상태의 상품만 승인할 수 있습니다');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'FOR_SALE',
        reviewed_at: new Date(),
        reviewed_by: adminId,
        review_reason: null, // 승인 시 검토 사유 삭제
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        images: true,
      },
    });

    // 판매자에게 상품 승인 알림
    await this.notificationsService.notifyProductApproved(
      product.seller_id,
      product.title,
      productId,
    );

    return updatedProduct;
  }

  // 상품 검토 거절 (삭제)
  async rejectProduct(productId: string, adminId: string, reason: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('검토 대기 상태의 상품만 삭제할 수 있습니다');
    }

    if (!reason || reason.trim() === '') {
      throw new BadRequestException('삭제 사유를 입력해주세요');
    }

    // 판매자에게 상품 거절 알림 (삭제 전에 알림 전송)
    await this.notificationsService.notifyProductRejected(
      product.seller_id,
      product.title,
      reason,
      productId,
    );

    // 상품 완전 삭제
    await this.prisma.product.delete({
      where: { id: productId },
    });

    return {
      message: '상품이 삭제되었습니다',
      deletedProduct: {
        id: product.id,
        title: product.title,
        seller: product.seller,
        reason: reason,
      },
    };
  }

  // 검토 대기 상품 수 조회 (대시보드용)
  async getPendingReviewCount() {
    const count = await this.prisma.product.count({
      where: { status: 'PENDING_REVIEW' },
    });

    return { count };
  }

  // 상품 게시 중지 (판매 잠금)
  async suspendProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // FOR_SALE 상태인 상품만 게시 중지 가능
    if (product.status !== 'FOR_SALE') {
      throw new BadRequestException('판매 중인 상품만 게시 중지할 수 있습니다');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'SUSPENDED' },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        images: true,
      },
    });

    return {
      success: true,
      message: '상품 게시가 중지되었습니다',
      product: updatedProduct,
    };
  }

  // 상품 게시 재개
  async unsuspendProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // SUSPENDED 상태인 상품만 게시 재개 가능
    if (product.status !== 'SUSPENDED') {
      throw new BadRequestException('게시 중지된 상품만 재개할 수 있습니다');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'FOR_SALE' },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        images: true,
      },
    });

    return {
      success: true,
      message: '상품 게시가 재개되었습니다',
      product: updatedProduct,
    };
  }
}
