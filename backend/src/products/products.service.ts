import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    const { title, description, price, category } = createProductDto;

    const product = await this.prisma.product.create({
      data: {
        seller_id: userId,
        title,
        description,
        price,
        category,
        status: 'FOR_SALE',
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
