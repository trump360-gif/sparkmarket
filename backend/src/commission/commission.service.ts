import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCommissionRateDto } from './dto/update-commission-rate.dto';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  // 현재 수수료율 조회
  async getCurrentRate() {
    let setting = await this.prisma.commissionSettings.findFirst({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });

    // 설정이 없으면 기본값 생성
    if (!setting) {
      setting = await this.prisma.commissionSettings.create({
        data: {
          commission_rate: 5.0,
          is_active: true,
        },
      });
    }

    return setting;
  }

  // 수수료율 업데이트
  async updateRate(updateDto: UpdateCommissionRateDto) {
    // 기존 설정 비활성화
    await this.prisma.commissionSettings.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    });

    // 새로운 설정 생성
    const newSetting = await this.prisma.commissionSettings.create({
      data: {
        commission_rate: updateDto.commission_rate,
        is_active: true,
      },
    });

    return newSetting;
  }

  // 수수료 통계 조회
  async getStatistics() {
    const [
      totalStats,
      monthlyStats,
      recentTransactions,
    ] = await Promise.all([
      // 전체 통계
      this.prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          product_price: true,
          commission_amount: true,
          seller_amount: true,
        },
        _count: true,
      }),

      // 이번 달 통계
      this.prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: {
          product_price: true,
          commission_amount: true,
          seller_amount: true,
        },
        _count: true,
      }),

      // 최근 거래 10건
      this.prisma.transaction.findMany({
        where: { status: 'COMPLETED' },
        take: 10,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      total: {
        transactions: totalStats._count,
        totalSales: totalStats._sum.product_price || 0,
        totalCommission: totalStats._sum.commission_amount || 0,
        totalSellerAmount: totalStats._sum.seller_amount || 0,
      },
      monthly: {
        transactions: monthlyStats._count,
        totalSales: monthlyStats._sum.product_price || 0,
        totalCommission: monthlyStats._sum.commission_amount || 0,
        totalSellerAmount: monthlyStats._sum.seller_amount || 0,
      },
      recentTransactions,
    };
  }

  // 거래 내역 조회 (페이지네이션)
  async getTransactions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { status: 'COMPLETED' },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.transaction.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
