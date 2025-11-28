import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    return this.prisma.brand.findMany({
      where,
      orderBy: [
        { is_popular: 'desc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findPopular(limit: number = 20) {
    return this.prisma.brand.findMany({
      where: { is_popular: true },
      orderBy: { name: 'asc' },
      take: limit,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('브랜드를 찾을 수 없습니다.');
    }

    return brand;
  }

  async findBrandProducts(
    id: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('브랜드를 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          brand_id: id,
          status: 'FOR_SALE',
        },
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
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          brand_id: id,
          status: 'FOR_SALE',
        },
      }),
    ]);

    return {
      brand,
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('브랜드를 찾을 수 없습니다.');
    }

    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('브랜드를 찾을 수 없습니다.');
    }

    if (brand._count.products > 0) {
      // 브랜드에 연결된 상품이 있는 경우, brand_id를 null로 설정
      await this.prisma.product.updateMany({
        where: { brand_id: id },
        data: { brand_id: null },
      });
    }

    await this.prisma.brand.delete({
      where: { id },
    });

    return { message: '브랜드가 삭제되었습니다.' };
  }
}
