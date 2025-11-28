import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(userId: string, createReportDto: CreateReportDto) {
    const { target_type, target_id, reason, description } = createReportDto;

    // 자기 자신을 신고할 수 없음
    if (target_type === 'USER' && target_id === userId) {
      throw new BadRequestException('자기 자신을 신고할 수 없습니다.');
    }

    // 신고 대상 존재 확인
    if (target_type === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: target_id },
      });
      if (!user) {
        throw new NotFoundException('신고할 사용자를 찾을 수 없습니다.');
      }
    } else if (target_type === 'PRODUCT') {
      const product = await this.prisma.product.findUnique({
        where: { id: target_id },
      });
      if (!product) {
        throw new NotFoundException('신고할 상품을 찾을 수 없습니다.');
      }

      // 자신의 상품을 신고할 수 없음
      if (product.seller_id === userId) {
        throw new BadRequestException('자신의 상품을 신고할 수 없습니다.');
      }
    }

    // 중복 신고 확인 (같은 사용자가 같은 대상을 같은 사유로 신고한 경우)
    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporter_id: userId,
        target_type,
        target_id,
        reason,
        status: 'PENDING',
      },
    });

    if (existingReport) {
      throw new BadRequestException('이미 신고한 내역이 있습니다.');
    }

    const report = await this.prisma.report.create({
      data: {
        reporter_id: userId,
        target_type,
        target_id,
        reason,
        description,
      },
      include: {
        reporter: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async getMyReports(
    userId: string,
    page: number = 1,
    limit: number = 20,
    queryDto?: QueryReportDto,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      reporter_id: userId,
    };

    if (queryDto?.status) {
      where.status = queryDto.status;
    }
    if (queryDto?.target_type) {
      where.target_type = queryDto.target_type;
    }
    if (queryDto?.reason) {
      where.reason = queryDto.reason;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllReports(
    page: number = 1,
    limit: number = 20,
    queryDto?: QueryReportDto,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto?.status) {
      where.status = queryDto.status;
    }
    if (queryDto?.target_type) {
      where.target_type = queryDto.target_type;
    }
    if (queryDto?.reason) {
      where.reason = queryDto.reason;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReport(
    reportId: string,
    adminId: string,
    updateReportDto: UpdateReportDto,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        ...updateReportDto,
        reviewed_by: adminId,
        reviewed_at: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async getReportById(reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    return report;
  }

  async deleteReport(reportId: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    if (report.reporter_id !== userId) {
      throw new ForbiddenException('본인이 작성한 신고만 삭제할 수 있습니다.');
    }

    if (report.status !== 'PENDING') {
      throw new BadRequestException('처리 중이거나 완료된 신고는 삭제할 수 없습니다.');
    }

    await this.prisma.report.delete({
      where: { id: reportId },
    });

    return { message: '신고가 삭제되었습니다.' };
  }
}
