import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionService } from '../commission/commission.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private commissionService: CommissionService,
  ) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    const { title, description, price, category, images } = createProductDto;

    const product = await this.prisma.product.create({
      data: {
        seller_id: userId,
        title,
        description,
        price,
        category,
        status: 'FOR_SALE',
        images: images
          ? {
              create: images.map((img) => ({
                url: img.url,
                key: img.key,
                order: img.order,
                is_primary: img.is_primary,
              })),
            }
          : undefined,
      },
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
    });

    return product;
  }

  async findAll(queryDto: QueryProductDto) {
    const { category, status, search, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

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
        orderBy: { created_at: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              nickname: true,
              avatar_url: true,
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

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
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

    // 조회수 증가 (비동기, 응답 속도에 영향 없도록)
    this.prisma.product.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    }).catch(err => console.error('Failed to increment view count:', err));

    return product;
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.seller_id !== userId) {
      throw new ForbiddenException('상품을 수정할 권한이 없습니다');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
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
    });

    return updatedProduct;
  }

  async purchase(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.status !== 'FOR_SALE') {
      throw new ForbiddenException('판매중인 상품이 아닙니다');
    }

    if (product.seller_id === userId) {
      throw new ForbiddenException('본인의 상품은 구매할 수 없습니다');
    }

    // 현재 수수료율 조회
    const commissionSettings = await this.commissionService.getCurrentRate();
    const commissionRate = commissionSettings.commission_rate;
    const commissionAmount = Math.floor((product.price * commissionRate) / 100);
    const sellerAmount = product.price - commissionAmount;

    // 트랜잭션으로 상품 상태 변경 및 거래 기록 생성
    const [updatedProduct, transaction] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { status: 'SOLD' },
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
      this.prisma.transaction.create({
        data: {
          product_id: id,
          seller_id: product.seller_id,
          buyer_id: userId,
          product_price: product.price,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_amount: sellerAmount,
          status: 'COMPLETED',
        },
      }),
    ]);

    return updatedProduct;
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 관리자이거나 본인의 상품만 삭제 가능
    if (userRole !== 'ADMIN' && product.seller_id !== userId) {
      throw new ForbiddenException('상품을 삭제할 권한이 없습니다');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: '상품이 삭제되었습니다' };
  }

  async findMyProducts(userId: string, queryDto: QueryProductDto) {
    const { status, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { seller_id: userId };

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
}
